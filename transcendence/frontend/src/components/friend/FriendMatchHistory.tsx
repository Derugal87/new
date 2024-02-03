import React, { useEffect, useState } from 'react';
import useFetch from '../../customHooks/useFetch';
import { useNavigate, useParams } from 'react-router-dom';

interface TableMatchHistory {
	tableData: any;
	friendId: number | null;
}

const TableContentMatchHistory = ({ tableData, friendId }: TableMatchHistory) => {
	const navigate = useNavigate();

	const handleShowFriend = (id: number) => {
		navigate(`/friend/${id}`);
	};

	return (
		<div style={{ marginTop: '20px', padding: '10px' }}>
			<table className="table">
				<thead>
					<tr>
						<th>My Nickname</th>
						<th>Result</th>
						<th>Opponent Nickname</th>
					</tr>
				</thead>
				<tbody>
					{tableData &&
						tableData.map((item: any) => {
							const resultString = item?.result;
							const resultArray = resultString?.split('-').map(Number);

							if (item?.creator?.id === friendId) {
								return (
									<tr
										key={item.id}
										className="row-style"
										onClick={() => handleShowFriend(item?.joiner?.id)}
									>
										<td>{item?.creator?.nickname}</td>
										<td>{resultArray ? `${resultArray[0]} - ${resultArray[1]}` : null}</td>
										<td>{item?.joiner?.nickname}</td>
									</tr>
								);
							}
							return (
								<tr
									key={item.id}
									className="row-style"
									onClick={() => handleShowFriend(item.creator?.id)}
								>
									<td>{item?.joiner?.nickname}</td>
									<td>{resultArray ? `${resultArray[1]} - ${resultArray[0]}` : null}</td>
									<td>{item?.creator?.nickname}</td>
								</tr>
							);
						})}
				</tbody>
			</table>
		</div>
	);
};

export default function FriendMatchHistory() {
	const { get } = useFetch('http://localhost:4000');

	const param = useParams();
	const id = param.id ? Number.parseInt(param.id, 10) : null;

	const [tableData, setTableData] = useState<any>(null);

	useEffect(() => {
		get(`/match/user/${id}`)
			.then((data: any) => {
				console.log('match_history,', data);
				setTableData(data);
			})
			.catch((e) => console.error(e));
	}, []);
	return (
		<div>
			<h2 className="match-history-text">Match History</h2>
			<TableContentMatchHistory tableData={tableData} friendId={id} />
		</div>
	);
}
