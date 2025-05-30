import {useEffect} from "react";
import {Button, Container, Group, Table, Title,} from "@mantine/core";
import {useDispatch, useSelector} from "react-redux";
import type {AppDispatch, RootState} from "../store.ts";
import {createBackup, deleteBackup, fetchBackups, restoreBackup} from "../reducers/admin_backups_reducer.ts";
import {unwrapResult} from "@reduxjs/toolkit";

const AdminBackupsPage = () => {
    const dispatch: AppDispatch = useDispatch();
    const backups = useSelector((state: RootState) => state.admin_backups.list);

    useEffect(() => {
        dispatch(fetchBackups());
    }, []);

    return (
        <Container size="lg" py="md">
            <Group justify="space-between">
                <Title order={2} mb="md">Manage Backups</Title>
                <Button onClick={() => dispatch(createBackup())
                    .then(unwrapResult)
                    .then(result => {
                        if (result.error === null)
                            dispatch(fetchBackups());
                    })
                }>Create backup</Button>
            </Group>

            <Table border={1} striped highlightOnHover>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {backups.map((backup) => (
                    <tr key={backup}>
                        <td>{backup}</td>
                        <td>
                            <Group gap="xs">
                                <Button
                                    size="xs"
                                    variant="outline"
                                    onClick={() => dispatch(deleteBackup(backup))
                                        .then(unwrapResult)
                                        .then(result => {
                                            if (result.error === null)
                                                dispatch(fetchBackups());
                                        })
                                }>Delete</Button>
                                <Button
                                    size="xs"
                                    variant="outline"
                                    onClick={() => dispatch(restoreBackup(backup))
                                        .then(unwrapResult)
                                        .then(result => {
                                            if (result.error === null)
                                                dispatch(fetchBackups());
                                        })
                                }>Restore</Button>
                            </Group>
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>
        </Container>
    );
};

export default AdminBackupsPage;
