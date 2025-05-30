import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
    TextInput,
    Switch,
    Button,
    Group,
    Container,
    Title,
    Text,
    Space,
    NumberInput,
} from "@mantine/core";
import type {Device} from "../types.ts";

const DeviceDetailPage = () => {
    const { deviceId } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [electricityPrice, setElectricityPrice] = useState(0);
    const [enabledAutomatically, setEnabledAutomatically] = useState(false);
    const [enabledManually, setEnabledManually] = useState(false);
    const [apiKey, setApiKey] = useState('');

    useEffect(() => {
        const fakeDevice: Device = {
            id: Number(deviceId!),
            name: `Device ${deviceId}`,
            api_key: "1234-ABCD-5678-EFGH",
            configuration: {
                device_id: Number(deviceId!),
                electricity_price: Math.random() * 10,
                enabled_auto: true,
                enabled_manually: false,
            }
        };
        setName(fakeDevice.name);
        setElectricityPrice(fakeDevice.configuration.electricity_price);
        setEnabledAutomatically(fakeDevice.configuration.enabled_auto);
        setEnabledManually(fakeDevice.configuration.enabled_manually);
        setApiKey(fakeDevice.api_key);
    }, [deviceId]);

    const handleToggleManual = () => {
        setEnabledManually((prev) => !prev);
    };

    const handleSave = () => {
        console.log("Saving device", {
            id: deviceId,
            name,
            electricityPrice,
            enabledAutomatically,
            enabledManually,
        });
    };

    const handleDelete = () => {
        console.log("Deleting device", deviceId);
        navigate("/devices");
    };

    const handleGoToSchedule = () => {
        navigate(`/devices/${deviceId}/schedule`);
    };

    return (
        <Container size="sm" py="md">
            <Title order={2} mb="md">Device Info</Title>

            <TextInput
                label="Device Name"
                value={name}
                onChange={(event) => setName(event.currentTarget.value)}
                mb="md"
            />

            <NumberInput
                label="Electricity Price (per kWh)"
                value={electricityPrice}
                onChange={(val) => setElectricityPrice(Number(val) || 0)}
                decimalScale={2}
                min={0}
                mb="md"
            />

            <TextInput
                label="API Key"
                value={apiKey}
                disabled
                mb="md"
            />

            <Switch
                label="Enabled Automatically"
                checked={enabledAutomatically}
                onChange={(event) => setEnabledAutomatically(event.currentTarget.checked)}
                mb="md"
            />

            <Group mb="md">
                <Text>Enabled Manually:</Text>
                <Button
                    onClick={handleToggleManual}
                    color={enabledManually ? "red" : "green"}
                    variant="light"
                >
                    {enabledManually ? "Turn Off" : "Turn On"}
                </Button>
            </Group>

            <Space h="md" />

            <Group>
                <Button onClick={handleSave}>Save Changes</Button>
                <Button color="gray" variant="outline" onClick={handleGoToSchedule}>
                    Go to Schedule
                </Button>
                <Button color="red" onClick={handleDelete}>Delete Device</Button>
            </Group>
        </Container>
    );
};

export default DeviceDetailPage;
