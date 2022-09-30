import React from 'react';
import { SyncingEditor } from './SyncingEditor';
import { useParams } from 'react-router-dom';

export const Group = () => {
  const { groupId } = useParams();
  return (
    <div style={styles.container}>
      <h3 style={styles.groupHeader}>Group: {groupId}</h3>
      <SyncingEditor groupId={groupId} />
    </div>
  );
};

const styles = {
  groupHeader: {
    textAlign: 'center',
    margin: '40px 0',
  },
  container: {
    maxWidth: '42em',
    padding: '20px',
    margin: '20px auto',
  },
};
