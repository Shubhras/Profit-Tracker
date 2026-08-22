import os
import tempfile
import zipfile

from django.db import transaction

from .detector import detect_blinkit_report
from .listing_importer import import_listing_report
from .order_importer import import_order_report
from .storage_importer import import_storage_report

SUPPORTED_EXTENSIONS = (
    ".xlsx",
    ".xlsm",
)

SUPPORTED_REPORT_TYPES = {
    "ORDER_FINANCIAL",
    "LISTING",
    "STORAGE",
}


def is_safe_zip_member(member):
    """
    Prevent path traversal when extracting ZIP files.

    Examples of unsafe paths:

        ../../file.xlsx
        /etc/file.xlsx
        folder/../../../file.xlsx
    """

    name = member.filename

    if not name:
        return False

    normalized = os.path.normpath(name)

    if normalized.startswith(".."):
        return False

    if os.path.isabs(normalized):
        return False

    return True


def get_supported_excel_files(zip_file):
    """
    Return only Excel files that can potentially be Blinkit reports.

    Unsupported files inside the ZIP are ignored.
    """

    files = []

    for member in zip_file.infolist():
        if member.is_dir():
            continue

        if not is_safe_zip_member(member):
            raise ValueError(f"Unsafe file path found in ZIP: {member.filename}")

        extension = os.path.splitext(member.filename)[1].lower()

        if extension not in SUPPORTED_EXTENSIONS:
            continue

        files.append(member)

    return files


def create_import_batch(
    *,
    account,
    file_name,
    report_type,
):
    """
    Create the ImportBatch for one report contained
    inside the ZIP.

    The actual payout period is populated by the
    individual importer when the report contains it.
    """

    from blinkit.models import BlinkitImportBatch

    return BlinkitImportBatch.objects.create(
        account=account,
        file_name=file_name,
        report_type=report_type,
    )


def import_report_file(
    *,
    file,
    file_name,
    account,
):
    """
    Detect and import one Excel report.

    Returns:

        {
            "status": "IMPORTED",
            "report_type": "...",
            "import_id": ...,
            "result": {...}
        }

    Unsupported reports are returned as SKIPPED.
    """

    file.seek(0)

    report_type = detect_blinkit_report(file)

    if report_type not in SUPPORTED_REPORT_TYPES:
        return {
            "status": "SKIPPED",
            "file_name": file_name,
            "report_type": None,
            "message": "Unsupported Blinkit report.",
        }

    # -------------------------------------------------------------
    # Create a separate ImportBatch for this report
    # -------------------------------------------------------------

    import_batch = create_import_batch(
        account=account,
        file_name=file_name,
        report_type=report_type,
    )

    try:
        file.seek(0)

        if report_type == "ORDER_FINANCIAL":
            result = import_order_report(
                file=file,
                account=account,
                import_batch=import_batch,
            )

        elif report_type == "LISTING":
            result = import_listing_report(
                file=file,
                account=account,
                import_batch=import_batch,
            )

        elif report_type == "STORAGE":
            result = import_storage_report(
                file=file,
                account=account,
                import_batch=import_batch,
            )

        else:
            return {
                "status": "SKIPPED",
                "file_name": file_name,
                "report_type": report_type,
                "message": (
                    f"Importer for report type '{report_type}' is not implemented."
                ),
            }

        return {
            "status": "IMPORTED",
            "file_name": file_name,
            "report_type": report_type,
            "import_id": import_batch.id,
            "payout_period_start": (import_batch.payout_period_start),
            "payout_period_end": (import_batch.payout_period_end),
            "result": result,
        }

    except Exception as exc:
        # ---------------------------------------------------------
        # Delete the empty/failed batch.
        #
        # We don't want a failed ZIP file to leave behind an
        # apparently valid ImportBatch.
        # ---------------------------------------------------------

        import_batch.delete()

        return {
            "status": "FAILED",
            "file_name": file_name,
            "report_type": report_type,
            "message": str(exc),
        }


def import_blinkit_zip(
    *,
    file,
    account,
):
    """
    Import a Blinkit ZIP containing multiple Excel reports.

    Supported reports:

        ORDER_FINANCIAL
        LISTING
        STORAGE

    Unsupported files/reports are skipped.

    Each supported report gets its own BlinkitImportBatch.
    """

    file.seek(0)

    if not zipfile.is_zipfile(file):
        raise ValueError("The uploaded file is not a valid ZIP file.")

    file.seek(0)

    results = []

    with zipfile.ZipFile(file, "r") as zip_file:
        excel_members = get_supported_excel_files(zip_file)

        if not excel_members:
            raise ValueError("The ZIP file does not contain any supported Excel files.")

        # ---------------------------------------------------------
        # Extract/import one Excel file at a time.
        #
        # We use a temporary directory so the uploaded ZIP is
        # never permanently extracted onto the server.
        # ---------------------------------------------------------

        with tempfile.TemporaryDirectory(prefix="blinkit_import_") as temp_dir:
            for member in excel_members:
                file_name = os.path.basename(member.filename)

                # -------------------------------------------------
                # Extract only this file
                # -------------------------------------------------

                extracted_path = os.path.join(
                    temp_dir,
                    file_name,
                )

                with zip_file.open(member) as source:
                    with open(
                        extracted_path,
                        "wb",
                    ) as destination:
                        while True:
                            chunk = source.read(1024 * 1024)

                            if not chunk:
                                break

                            destination.write(chunk)

                # -------------------------------------------------
                # Import the Excel file
                # -------------------------------------------------

                with open(
                    extracted_path,
                    "rb",
                ) as excel_file:
                    result = import_report_file(
                        file=excel_file,
                        file_name=file_name,
                        account=account,
                    )

                results.append(result)

    # -------------------------------------------------------------
    # Summary
    # -------------------------------------------------------------

    imported = [result for result in results if result["status"] == "IMPORTED"]

    skipped = [result for result in results if result["status"] == "SKIPPED"]

    failed = [result for result in results if result["status"] == "FAILED"]

    return {
        "files_found": len(excel_members),
        "files_imported": len(imported),
        "files_skipped": len(skipped),
        "files_failed": len(failed),
        "imports": results,
    }
