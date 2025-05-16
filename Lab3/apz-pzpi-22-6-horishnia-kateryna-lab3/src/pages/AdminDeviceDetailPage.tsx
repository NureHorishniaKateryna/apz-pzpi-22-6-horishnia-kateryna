import { useEffect, useState } from "react";
import {
    Container,
    Title,
    TextInput,
    Switch,
    Button,
    Group,
    Stack, LoadingOverlay,
} from "@mantine/core";
import {useNavigate, useParams} from "react-router";
import {useDisclosure} from "@mantine/hooks";

export type User = {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    is_admin: boolean;
};

export type DeviceConfig = {
    device_id: number;
    enabled_manually: boolean;
    enabled_auto: boolean;
    electricity_price: number;
};

export type Device = {
    id: number;
    name: string;
    api_key: string;
    configuration: DeviceConfig;
};

export type AdminDevice = Device & {
    user: User;
};

const generateFakeDevice = (id: number): AdminDevice => ({
    id,
    name: `Device ${id}`,
    api_key: `api_key_${id}`,
    configuration: {
        device_id: id,
        enabled_manually: Math.random() < 0.5,
        enabled_auto: Math.random() < 0.5,
        electricity_price: parseFloat((Math.random() * 0.5 + 0.1).toFixed(2)),
    },
    user: {
        id,
        email: `user${id}@example.com`,
        first_name: `First${id}`,
        last_name: `Last${id}`,
        is_admin: Math.random() < 0.3,
    },
});

const AdminDeviceDetailPage = () => {
    const { deviceId } = useParams();
    const [device, setDevice] = useState<AdminDevice | null>(null);
    const [loading, { open: setLoading, close: setNotLoading }] = useDisclosure(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (deviceId) {
            setDevice(generateFakeDevice(parseInt(deviceId)));
        }
    }, [deviceId]);

    const toggleManual = () => {
        if (device) {
            setDevice({
                ...device,
                configuration: {
                    ...device.configuration,
                    enabled_manually: !device.configuration.enabled_manually,
                },
            });
        }
    };

    const save = async () => {
        if (!device) return;
        console.log(device);

        setLoading();
        await new Promise(resolve => setTimeout(resolve, 1000));
        setNotLoading();
    };

    const remove = async () => {
        if (!device) return;
        console.log(device.id);

        setLoading();
        await new Promise(resolve => setTimeout(resolve, 1000));
        setNotLoading();
        navigate("/admin/devices");
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
                    value={device.name}
                    onChange={(e) => setDevice({ ...device, name: e.currentTarget.value })}
                />
                <TextInput
                    label="Electricity Price ($/kWh)"
                    type="number"
                    value={device.configuration.electricity_price}
                    onChange={(e) =>
                        setDevice({
                            ...device,
                            configuration: {
                                ...device.configuration,
                                electricity_price: parseFloat(e.currentTarget.value) || 0,
                            },
                        })
                    }
                />
                <Switch
                    label="Enabled Automatically"
                    checked={device.configuration.enabled_auto}
                    onChange={(e) =>
                        setDevice({
                            ...device,
                            configuration: {
                                ...device.configuration,
                                enabled_auto: e.currentTarget.checked,
                            },
                        })
                    }
                />
                <Button
                    variant={device.configuration.enabled_manually ? "filled" : "outline"}
                    color={device.configuration.enabled_manually ? "green" : "gray"}
                    onClick={toggleManual}
                >
                    {device.configuration.enabled_manually ? "Turn Off" : "Turn On"}
                </Button>
                <Group mt="md">
                    <Button onClick={save}>Save</Button>
                    <Button color="red" variant="outline" onClick={remove}>Delete</Button>
                </Group>
            </Stack>
        </Container>
    );
};

export default AdminDeviceDetailPage;
