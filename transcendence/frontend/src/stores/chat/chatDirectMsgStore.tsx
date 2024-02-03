import { hookstate } from '@hookstate/core';

export const direct_msg_socket = hookstate<any>(null);
export const direct_msg_data = hookstate<any>(null);
export const blocking_socket = hookstate<any>(null);
