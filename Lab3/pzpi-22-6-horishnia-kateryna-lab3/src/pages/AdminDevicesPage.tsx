import React, {useEffect, useState} from "react";
import {Button, Container, Group, Pagination, Table, Title,} from "@mantine/core";
import {useNavigate} from "react-router";
import {useDispatch, useSelector} from "react-redux";
import type {AppDispatch, RootState} from "../store.ts";
import {fetchDevices} from "../reducers/admin_devices_reducer.ts";

const AdminDevicesPage: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const devices = useSelector((state: RootState) => state.admin_devices.list);
    const pagesCount = useSelector((state: RootState) => state.admin_devices.pages);

    const [page, setPage] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(fetchDevices(page));
    }, [page]);

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
                {devices.map((device) => (
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
                total={pagesCount}
                mt="md"
            />
        </Container>
    );
};

export default AdminDevicesPage;
