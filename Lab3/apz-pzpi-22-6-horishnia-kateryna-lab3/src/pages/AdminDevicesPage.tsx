import React, { useEffect, useState } from "react";
import {
    Container,
    Title,
    Table,
    Button,
    Group,
    Pagination,
} from "@mantine/core";
import { useNavigate } from "react-router";
import type {AdminDevice} from "../types.ts";

const generateFakeDevices = (count: number): AdminDevice[] => {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        user: {
            id: i,
            email: `user${(i % 10) + 1}@example.com`,
            first_name: "first",
            last_name: "last",
            is_admin: false,
        },
        name: `Device ${i + 1}`,
        api_key: "some-key",
        configuration: {
            device_id: i,
            enabled_manually: Math.random() > 0.5,
            enabled_auto: Math.random() > 0.5,
            electricity_price: Math.random() * 10,
        }
    }));
};

const PAGE_SIZE = 10;

const AdminDevicesPage: React.FC = () => {
    const [devices, setDevices] = useState<AdminDevice[]>([]);
    const [page, setPage] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        setDevices(generateFakeDevices(48));
    }, []);

    const paginatedDevices = devices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <Container size="lg" py="md">
            <Title order={2} mb="md">Manage Devices</Title>
            <Table border={1} striped highlightOnHover>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Owner Email</th>
                    <th>Name</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {paginatedDevices.map((device) => (
                    <tr key={device.id}>
                        <td>{device.id}</td>
                        <td>{device.user.email}</td>
                        <td>{device.name}</td>
                        <td>
                            <Group gap="xs">
                                <Button
                                    size="xs"
                                    variant="outline"
                                    onClick={() => navigate(`/admin/devices/${device.id}`)}
                                >
                                    Manage
                                </Button>
                            </Group>
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>

            <Pagination
                value={page}
                onChange={setPage}
                total={Math.ceil(devices.length / PAGE_SIZE)}
                mt="md"
            />
        </Container>
    );
};

export default AdminDevicesPage;
