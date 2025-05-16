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
    NumberInput, Divider, Card, LoadingOverlay,
} from "@mantine/core";
import type {Device} from "../types.ts";
import InfiniteScroll from "react-infinite-scroll-component";
import {useDisclosure} from "@mantine/hooks";

type Report = {
    id: string;
    status: boolean;
    time: number;
};

const generateFakeReports = (count: number, offset: number): Report[] => {
    return Array.from({ length: count }, (_, i) => {
        return {
            id: `r-${offset + i}`,
            status: Math.random() > 0.5,
            time: Date.now() - (offset + i) * 60 * 1000,
        };
    });
};

const DeviceDetailPage = () => {
    const { deviceId } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [electricityPrice, setElectricityPrice] = useState(0);
    const [enabledAutomatically, setEnabledAutomatically] = useState(false);
    const [enabledManually, setEnabledManually] = useState(false);
    const [apiKey, setApiKey] = useState("");

    const [reports, setReports] = useState<Report[]>([]);
    const [hasMoreReports, setHasMoreReports] = useState(true);
    const [reportOffset, setReportOffset] = useState(0);

    const [loading, { open: setLoading, close: setNotLoading }] = useDisclosure(false);

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

        const initialReports = generateFakeReports(20, 0);
        setReports(initialReports);
        setReportOffset(20);
    }, [deviceId]);

    const loadMoreReports = () => {
        const newReports = generateFakeReports(10, reportOffset);
        if (newReports.length === 0) {
            setHasMoreReports(false);
        } else {
            setReports((prev) => [...prev, ...newReports]);
            setReportOffset((prev) => prev + newReports.length);
        }
    };

    const handleToggleManual = () => {
        setEnabledManually((prev) => !prev);
    };

    const handleSave = async () => {
        console.log({
            id: deviceId,
            name: name,
            electricity_price: electricityPrice,
            enabled_auto: enabledAutomatically,
            enabled_manually: enabledManually,
        });

        setLoading();
        await new Promise(resolve => setTimeout(resolve, 1000));
        setNotLoading();
    };

    const handleDelete = async () => {
        console.log(deviceId);

        setLoading();
        await new Promise(resolve => setTimeout(resolve, 1000));
        setNotLoading();
        navigate("/devices");
    };

    const handleGoToSchedule = () => {
        navigate(`/devices/${deviceId}/schedule`);
    };

    return (
        <Container size="sm" py="md">
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

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

            <Divider my="md" />
            <Title order={3} mb="md">Device Reports</Title>

            <InfiniteScroll
                dataLength={reports.length}
                next={loadMoreReports}
                hasMore={hasMoreReports}
                loader={<Text ta="center" mt="md">Loading more...</Text>}
                endMessage={<Text ta="center" c="dimmed" mt="md">No more reports</Text>}
            >
                {reports.map((report) => (
                    <Card key={report.id} shadow="xs" p="sm" radius="md" mb="sm" withBorder>
                        <Group justify="space-between">
                            <Text c={report.status ? "green" : "red"}>{report.status ? 'Turned On' : 'Turned Off'}</Text>
                            <Text size="sm" c="dimmed">{new Date(report.time).toLocaleString()}</Text>
                        </Group>
                    </Card>
                ))}
            </InfiniteScroll>
        </Container>
    );
};

export default DeviceDetailPage;
