import {useEffect, useState} from 'react';
import {Badge, Button, Container, Group, Pagination, Table, Title,} from '@mantine/core';
import {useNavigate} from 'react-router';
import type {User} from "../types.ts";


const generateFakeUsers = (count: number): User[] => {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        email: `user${i + 1}@example.com`,
        first_name: `First ${i}`,
        last_name: `Last ${i}`,
        is_admin: Math.random() < 0.1,
    }));
};

const PAGE_SIZE = 10;

const AdminUsersPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [page, setPage] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        setUsers(generateFakeUsers(550));
    }, []);

    const paginatedUsers = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
                {paginatedUsers.map((user) => (
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
                    total={Math.ceil(users.length / PAGE_SIZE)}
                    mt="md"
                />
            </div>
        </Container>
    );
};

export default AdminUsersPage;
