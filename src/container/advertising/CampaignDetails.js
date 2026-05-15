import React from 'react';
import { useParams } from 'react-router-dom';

function CampaignDetails() {
  const { campaignId } = useParams();

  return (
    <div
      style={{
        background: 'red',
        width: '100vw',
        height: '100vh',
        color: 'white',
        fontSize: '40px',
        padding: '40px',
      }}
    >
      Campaign Details {campaignId}
    </div>
  );
}

export default CampaignDetails;
