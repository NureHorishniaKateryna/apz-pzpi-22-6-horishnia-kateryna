import {useEffect, useState} from 'react';
import {Badge, Button, Container, Group, Pagination, Table, Title,} from '@mantine/core';
import {useNavigate} from 'react-router';
import {useDispatch, useSelector} from "react-redux";
import type {AppDispatch, RootState} from "../store.ts";
import {fetchUsers} from "../reducers/admin_users_reducer.ts";


const AdminUsersPage = () => {
    const dispatch: AppDispatch = useDispatch();
    const users = useSelector((state: RootState) => state.admin_users.list);
    const pagesCount = useSelector((state: RootState) => state.admin_users.pages);
    const [page, setPage] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(fetchUsers(page));
    }, [page]);

    return (
        <Container size="lg" py="md">
            <Title order={2} mb="md">Manage Users</Title>
            <Table border={1} striped highlightOnHover>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Admin</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {users.map((user) => (
                    <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.email}</td>
                        <td>{user.first_name}</td>
                        <td>{user.last_name}</td>
                        <td>
                            {user.is_admin ? (
                                <Badge color="green">Yes</Badge>
                            ) : (
                                <Badge color="gray">No</Badge>
                            )}
                        </td>
                        <td>
                            <Group gap="xs">
                                <Button
                                    size="xs"
                                    variant="outline"
                                    onClick={() => navigate(`/admin/users/${user.id}`)}
                                >
                                    Manage
                                </Button>
                            </Group>
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>

            <div style={{display: "flex", justifyContent: "right"}}>
                <Pagination
                    value={page}
                    onChange={setPage}
                    total={pagesCount}
                    mt="md"
                />
            </div>
        </Container>
    );
};

export default AdminUsersPage;
