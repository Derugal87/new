import { hookstate } from '@hookstate/core';
import { useParams } from 'react-router-dom';

const activeTab = hookstate('users');

export default activeTab;

export const channelUserId = hookstate<number | null>(null);
