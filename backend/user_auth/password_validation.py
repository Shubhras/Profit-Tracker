import re

PASSWORD_REGEX = re.compile(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$')

def validate_password_policy(password, user=None, email=None, username=None, full_name=None, business_name=None):
    """
    Validates password in strict accordance with Amazon DPP (Credential Management 1.4):
    1. Minimum 12 characters length.
    2. Contains at least one uppercase letter, one lowercase letter, one number, and one special character.
    3. Strictly forbids using username, email, full name, business name, or recognizable parts of them as part of the password.
    """
    if not password:
        return False, "Password is required."

    if not PASSWORD_REGEX.match(password):
        return False, "Password must be at least 12 characters and include uppercase, lowercase, number, and special character."

    identifiers = set()

    if user:
        if getattr(user, 'username', None):
            identifiers.add(str(user.username).lower())
        if getattr(user, 'email', None):
            user_email = str(user.email).lower().strip()
            identifiers.add(user_email)
            if '@' in user_email:
                prefix = user_email.split('@')[0]
                identifiers.add(prefix)
                for part in re.findall(r'[a-z]+|\d+', prefix):
                    if len(part) >= 3 and not part.isdigit():
                        identifiers.add(part)
        if getattr(user, 'first_name', None) and user.first_name:
            identifiers.add(str(user.first_name).lower())
        if getattr(user, 'last_name', None) and user.last_name:
            identifiers.add(str(user.last_name).lower())
        # Check user profile business name if available
        profile = getattr(user, 'profile', None)
        if profile and getattr(profile, 'business_name', None) and profile.business_name:
            identifiers.add(str(profile.business_name).lower())
            for part in str(profile.business_name).strip().lower().split():
                cleaned_part = re.sub(r'[^a-z0-9]', '', part)
                if len(cleaned_part) >= 3:
                    identifiers.add(cleaned_part)

    if email:
        email_clean = str(email).strip().lower()
        identifiers.add(email_clean)
        if '@' in email_clean:
            prefix = email_clean.split('@')[0]
            identifiers.add(prefix)
            for part in re.findall(r'[a-z]+|\d+', prefix):
                if len(part) >= 3 and not part.isdigit():
                    identifiers.add(part)

    if username:
        identifiers.add(str(username).strip().lower())

    if full_name:
        for part in str(full_name).strip().lower().split():
            cleaned_part = re.sub(r'[^a-z0-9]', '', part)
            if len(cleaned_part) >= 3:
                identifiers.add(cleaned_part)

    if business_name:
        b_clean = re.sub(r'[^a-z0-9]', '', str(business_name).strip().lower())
        if len(b_clean) >= 3:
            identifiers.add(b_clean)
        for part in str(business_name).strip().lower().split():
            cleaned_part = re.sub(r'[^a-z0-9]', '', part)
            if len(cleaned_part) >= 3:
                identifiers.add(cleaned_part)

    pwd_lower = password.lower()

    # Check if any word from password appears in email prefix
    if email and '@' in str(email):
        prefix = str(email).split('@')[0].lower()
        for word in re.findall(r'[a-zA-Z]+', password):
            if len(word) >= 4 and word.lower() in prefix:
                return False, "Password cannot contain your username, name, email, or business name."

    for identifier in identifiers:
        # Ignore fragments shorter than 3 characters to avoid false positives on random single chars
        cleaned = re.sub(r'[^a-z0-9]', '', identifier)
        if len(cleaned) >= 3 and cleaned in pwd_lower:
            return False, "Password cannot contain your username, name, email, or business name."

    return True, None
