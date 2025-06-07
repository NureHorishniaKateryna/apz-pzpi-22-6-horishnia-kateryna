import {useEffect, useRef, useState} from "react";
import {useNavigate, useParams} from "react-router";
import {
    Button,
    Card,
    Container,
    Divider,
    Group,
    LoadingOverlay,
    NumberInput,
    Space,
    Switch,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import type {Device} from "../types.ts";
import InfiniteScroll from "react-infinite-scroll-component";
import {useDisclosure} from "@mantine/hooks";
import {deleteDevice, editDevice, fetchDevice} from "../reducers/device_reducer.ts";
import {unwrapResult} from "@reduxjs/toolkit";
import {useDispatch, useSelector} from "react-redux";
import type {AppDispatch, RootState} from "../store.ts";
import {fetchReports} from "../reducers/device_report_reducer.ts";

const DeviceDetailPage = () => {
    const { deviceId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const [name, setName] = useState("");
    const [electricityPrice, setElectricityPrice] = useState(0);
    const [enabledAutomatically, setEnabledAutomatically] = useState(false);
    const [enabledManually, setEnabledManually] = useState(false);
    const [apiKey, setApiKey] = useState("");

    const reportsPage = useSelector((state: RootState) => state.reports.page);
    const hasMoreReports = useSelector((state: RootState) => state.reports.hasMore);
    const reports = useSelector((state: RootState) => state.reports.list);
    const reportsInitialized = useRef(false)

    const [loading, { open: setLoading, close: setNotLoading }] = useDisclosure(false);

    const setDeviceInfo = (device: Device) => {
        setName(device.name);
        setElectricityPrice(device.configuration.electricity_price);
        setEnabledAutomatically(device.configuration.enabled_auto);
        setEnabledManually(device.configuration.enabled_manually);
        setApiKey(device.api_key);
    }

    useEffect(() => {
        setLoading();
        dispatch(fetchDevice(Number(deviceId)))
            .then(unwrapResult)
            .then(result_ => {
                setNotLoading();
                const {result} = result_;
                if(result === null)
                    return;

                setDeviceInfo(result);

                if (reports.length === 0 && !reportsInitialized.current) {
                    reportsInitialized.current = true;
                    dispatch(fetchReports({deviceId: Number(deviceId), page: 1}));
                }
            });
    }, [deviceId]);

    const loadMoreReports = () => dispatch(fetchReports({deviceId: Number(deviceId), page: reportsPage}));

    const handleToggleManual = () => {
        setEnabledManually((prev) => !prev);
    };

    const handleSave = async () => {
        setLoading();

        dispatch(editDevice({
            id: Number(deviceId),
            name: name,
            electricity_price: electricityPrice,
            enabled_auto: enabledAutomatically,
            enabled_manually: enabledManually,
        }))
            .then(unwrapResult)
            .then(result_ => {
                setNotLoading();
                const {result} = result_;
                if(result === null)
                    return;

                setDeviceInfo(result);
            });
    };

    const handleDelete = async () => {
        setLoading();

        dispatch(deleteDevice(Number(deviceId)))
            .then(unwrapResult)
            .then(result_ => {
                setNotLoading();
                const {result} = result_;
                if(result)
                    navigate("/devices");
            });

    };

    const handleGoToSchedule = () => navigate(`/devices/${deviceId}/schedule`);
    const handleGoToAnalytics = () => navigate(`/devices/${deviceId}/analytics`);

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
                <Button color="green" onClick={handleSave}>Save Changes</Button>
                <Button color="blue" variant="outline" onClick={handleGoToAnalytics}>
                    View analytics
                </Button>
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
                    <Card key={report.time} shadow="xs" p="sm" radius="md" mb="sm" withBorder>
                        <Group justify="space-between">
                            <Text c={report.enabled ? "green" : "red"}>{report.enabled ? 'Turned On' : 'Turned Off'}</Text>
                            <Text size="sm" c="dimmed">{new Date(report.time * 1000).toLocaleString()}</Text>
                        </Group>
                    </Card>
                ))}
            </InfiniteScroll>
        </Container>
    );
};

export default DeviceDetailPage;
