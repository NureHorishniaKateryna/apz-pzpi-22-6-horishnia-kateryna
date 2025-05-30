import {useEffect, useState} from "react";
import {Button, Container, Group, LoadingOverlay, Stack, Switch, TextInput, Title,} from "@mantine/core";
import {useNavigate, useParams} from "react-router";
import {useDisclosure} from "@mantine/hooks";
import type {Device, User} from "../types.ts";
import type {AppDispatch, RootState} from "../store.ts";
import {useDispatch, useSelector} from "react-redux";
import {unwrapResult} from "@reduxjs/toolkit";
import {deleteDevice, editDevice, fetchDevice} from "../reducers/admin_devices_reducer.ts";

export type AdminDevice = Device & {
    user: User;
};

const AdminDeviceDetailPage = () => {
    const { deviceId } = useParams();
    const dispatch: AppDispatch = useDispatch();
    const device = useSelector((state: RootState) => state.admin_devices.current) as (AdminDevice | null);

    const [name, setName] = useState("");

    const [loading, { open: setLoading, close: setNotLoading }] = useDisclosure(false);
    const navigate = useNavigate();

    const setDeviceMaybe = (device: AdminDevice | null) => {
        setNotLoading();
        if(device === null) return;

        setName(device.name);
    }

    useEffect(() => {
        if (deviceId) {
            setLoading();
            dispatch(fetchDevice(Number(deviceId)))
                .then(unwrapResult)
                .then(({result}) => setDeviceMaybe(result as (AdminDevice | null)));
        }
    }, [deviceId]);

    const save = async () => {
        if (!device) return;

        setLoading();
        dispatch(editDevice({
            deviceId: Number(deviceId),
            name: name,
        }))
            .then(unwrapResult)
            .then(({result}) => setDeviceMaybe(result as (AdminDevice | null)));
    };

    const remove = async () => {
        if (!device) return;

        setLoading();
        dispatch(deleteDevice(Number(deviceId)))
            .then(unwrapResult)
            .then(({result}) => result && navigate("/admin/devices"));
    };

    if (!device) return null;

    return (
        <Container size="sm" py="md">
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

            <Title order={2} mb="md">Manage Device</Title>
            <Stack>
                <TextInput label="Device ID" value={device.id.toString()} disabled />
                <TextInput label="API Key" value={device.api_key} disabled />
                <TextInput label="Owner Email" value={device.user.email} disabled />
                <TextInput label="Owner First Name" value={device.user.first_name} disabled />
                <TextInput label="Owner Last Name" value={device.user.last_name} disabled />
                <TextInput
                    label="Device Name"
                    value={name}
                    onChange={(e) => setName(e.currentTarget.value)}
                />
                <TextInput
                    label="Electricity Price ($/kWh)"
                    type="number"
                    value={device?.configuration?.electricity_price}
                    disabled
                />
                <Switch
                    label="Enabled Automatically"
                    checked={device?.configuration?.enabled_auto}
                    disabled
                />
                <Switch
                    label="Enabled Manually"
                    checked={device?.configuration?.enabled_manually}
                    disabled
                />
                <Group mt="md">
                    <Button onClick={save}>Save</Button>
                    <Button color="red" variant="outline" onClick={remove}>Delete</Button>
                </Group>
            </Stack>
        </Container>
    );
};

export default AdminDeviceDetailPage;
