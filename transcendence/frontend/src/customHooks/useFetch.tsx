import { useState } from 'react';

export default function useFetch(baseUrl: string) {
	const [loading, setLoading] = useState(true);

	const refreshToken = async () => {
		// Call your API endpoint to refresh the token
		console.log('Refreshing token...');
		console.log('Refresh token: ', localStorage.getItem('refreshToken'));
		if (!localStorage.getItem('refreshToken')) {
			return false;
		}
		const response = await fetch(baseUrl + '/auth/refresh', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ refreshToken: localStorage.getItem('refreshToken') }),
		});

		const data = await response.json();

		if (response.ok) {
			console.log('Refreshed token: ', data.accessToken);
			localStorage.setItem('token', data.accessToken);
			return true;
		} else {
			// Handle refresh token expiration or other issues
			// Perhaps redirect to login or show a message
			console.log('Error refreshing token: ', data.message);
			return false;
		}
	};

	// function get(url: string, shouldCatchErrors: boolean = true) {
	// 	return new Promise((resolve, reject) => {
	// 		fetch(baseUrl + url, {
	// 			method: 'get',
	// 			headers: {
	// 				'Authorization': `Bearer ${localStorage.getItem('token')}`
	// 			}
	// 		})
	// 			.then(async (response) => {
	// 				if (response.status === 401) { // Unauthorized
	// 					const refreshSuccessful = await refreshToken();
	// 					if (refreshSuccessful) {
	// 						// Retry the original request with the new token
	// 						fetch(baseUrl + url, {
	// 							method: 'get',
	// 							headers: {
	// 								'Authorization': `Bearer ${localStorage.getItem('token')}`
	// 							}
	// 						})
	// 							.then(response => response.json())
	// 							.then(data => {
	// 								setLoading(false);
	// 								resolve(data);
	// 							})
	// 							.catch(retryError => {
	// 								setLoading(false);
	// 								reject(retryError);
	// 							});

	// 					} else {
	// 						setLoading(false);
	// 						return reject('Unauthorized - Unable to refresh token');
	// 					}
	// 				} else {
	// 					const data = await response.json();
	// 					if (!data) {
	// 						setLoading(false);
	// 						return reject(data);
	// 					}
	// 					setLoading(false);
	// 					resolve(data);
	// 				}
	// 			})
	// 			.catch((error) => {
	// 				setLoading(false);
	// 				if (shouldCatchErrors) {
	// 					reject(error);
	// 				} else {
	// 					throw error;  // Propagate the error if shouldCatchErrors is false
	// 				}
	// 			});
	// 	});
	// }

	function get(url: string, shouldCatchErrors: boolean = true) {
		return new Promise(async (resolve, reject) => {
			let attempt = 0;
			while (attempt < 2) {
				try {
					const response = await fetch(baseUrl + url, {
						method: 'get',
						headers: {
							Authorization: `Bearer ${localStorage.getItem('token')}`,
						},
					});

					if (response.status === 401 && attempt === 0) {
						// Unauthorized
						const refreshSuccessful = await refreshToken();
						if (refreshSuccessful) {
							attempt++;
							continue; // Retry the request
						} else {
							setLoading(false);
							return reject('Unauthorized - Unable to refresh token');
						}
					}

					if (!response.ok) {
						setLoading(false);
						throw new Error(`Network response was not ok: ${response.statusText}`);
					}

					const data = await response.json();
					if (!data) {
						setLoading(false);
						return reject('No data returned');
					}
					return resolve(data);
				} catch (error) {
					if (attempt > 0 || !shouldCatchErrors) {
						setLoading(false);
						return reject(error); // Reject if it's the second attempt or if error handling is disabled
					}
					attempt++;
				}
			}
		});
	}

	function post(url: string, body: object) {
		return new Promise(async (resolve, reject) => {
			let attempt = 0;
			while (attempt < 2) {
				try {
					const response = await fetch(baseUrl + url, {
						method: 'post',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${localStorage.getItem('token')}`,
						},
						body: JSON.stringify(body),
					});

					if (response.status === 401 && attempt === 0) {
						// Unauthorized
						const refreshSuccessful = await refreshToken();
						if (refreshSuccessful) {
							attempt++;
							continue; // Retry the request
						} else {
							setLoading(false);
							return reject('Unauthorized - Unable to refresh token');
						}
					}

					if (!response.ok) {
						setLoading(false);
						throw new Error(`Network response was not ok: ${response.statusText}`);
					}

					const text = await response.text();
					const data = text ? JSON.parse(text) : null;
					setLoading(false);
					return resolve(data);
				} catch (error) {
					if (attempt > 0) {
						setLoading(false);
						return reject(error); // Reject if it's the second attempt
					}
					attempt++;
				}
			}
		});
	}

	function put(url: string, body: object) {
		return new Promise(async (resolve, reject) => {
			let attempt = 0;
			const requestBody = JSON.stringify(body || {});

			while (attempt < 2) {
				try {
					const response = await fetch(baseUrl + url, {
						method: 'put',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${localStorage.getItem('token')}`,
						},
						body: requestBody,
					});

					if (response.status === 401 && attempt === 0) {
						// Unauthorized
						const refreshSuccessful = await refreshToken();
						if (refreshSuccessful) {
							attempt++;
							continue; // Retry the request
						} else {
							setLoading(false);
							return reject('Unauthorized - Unable to refresh token');
						}
					}

					if (!response.ok) {
						setLoading(false);
						throw new Error(`Request failed with status: ${response.status}`);
					}

					const text = await response.text();
					const data = text ? JSON.parse(text) : null;
					setLoading(false);
					return resolve(data);
				} catch (error) {
					if (attempt > 0) {
						setLoading(false);
						return reject(error); // Reject if it's the second attempt
					}
					attempt++;
				}
			}
		});
	}
	function del(url: string) {
		return new Promise(async (resolve, reject) => {
			let attempt = 0;
			while (attempt < 2) {
				try {
					const response = await fetch(baseUrl + url, {
						method: 'delete',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${localStorage.getItem('token')}`,
						},
					});

					if (response.status === 401 && attempt === 0) {
						// Unauthorized
						const refreshSuccessful = await refreshToken();
						if (refreshSuccessful) {
							attempt++;
							continue; // Retry the request
						} else {
							setLoading(false);
							return reject('Unauthorized - Unable to refresh token');
						}
					}

					if (!response.ok) {
						setLoading(false);
						throw new Error(`Network response was not ok: ${response.statusText}`);
					}

					const text = await response.text();
					const data = text ? JSON.parse(text) : null;
					setLoading(false);
					return resolve(data);
				} catch (error) {
					if (attempt > 0) {
						setLoading(false);
						return reject(error); // Reject if it's the second attempt
					}
					attempt++;
				}
			}
		});
	}

	// 	function put(url: string, body: object) {
	// 		const requestBody = JSON.stringify(body || {}); // stringify body or use an empty object

	// 		return new Promise((resolve, reject) => {
	// 			fetch(baseUrl + url, {
	// 				method: 'put',
	// 				headers: {
	// 					'Content-Type': 'application/json',
	// 					'Authorization': `Bearer ${localStorage.getItem('token')}`,
	// 				},
	// 				body: requestBody,
	// 			})
	// 				.then((response: any) => {
	// 					if (!response.ok) {
	// 						// Handle non-successful responses here (e.g., reject with an error message)
	// 						setLoading(false);
	// 						return reject(`Request failed with status: ${response.status}`);
	// 					}
	// 					return response.text(); // Read the response as text
	// 				})
	// 				.then((data) => {
	// 					try {
	// 						// Attempt to parse JSON only if there is data
	// 						const parsedData = data ? JSON.parse(data) : null;
	// 						setLoading(false);
	// 						resolve(parsedData);
	// 					} catch (error) {
	// 						// Handle JSON parsing errors
	// 						setLoading(false);
	// 						reject(error);
	// 					}
	// 				})
	// 				.catch((error) => {
	// 					setLoading(false);
	// 					reject(error);
	// 				});
	// 		});
	// 	}

	// 	async function del(url: string) {
	// 		try {
	// 			const response = await fetch(baseUrl + url, {
	// 				method: 'delete',
	// 				headers: {
	// 					'Content-Type': 'application/json',
	// 				},
	// 			});

	// 			if (!response.ok) {
	// 				// Handle non-successful HTTP responses (e.g., 404, 500)
	// 				throw new Error('Network response was not ok');
	// 			}

	// 			// Check if the response body is empty
	// 			const text = await response.text();
	// 			if (!text) {
	// 				setLoading(false);
	// 				return null;
	// 			}

	// 			const data = JSON.parse(text);

	// 			setLoading(false);
	// 			return data;
	// 		} catch (error) {
	// 			setLoading(false);
	// 			throw error;
	// 		}
	// 	}

	return { get, post, put, del, loading };
}
