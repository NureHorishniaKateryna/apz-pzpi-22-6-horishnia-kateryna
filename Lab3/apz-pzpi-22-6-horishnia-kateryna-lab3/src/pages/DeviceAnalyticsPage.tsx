import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Container, Title, Card, Text, Grid, Space } from "@mantine/core";
import type { DeviceAnalytics } from "../types";

const formatSeconds = (seconds: number) => {
    const h = Math.floor(seconds / 60 / 60);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
};

const generateAnalytics = (): DeviceAnalytics => {
    const enabledCount = Math.floor(Math.random() * 40) + 10;
    const totalMinutes = enabledCount * (30 + Math.floor(Math.random() * 60 * 60));
    const avgMinutes = totalMinutes / enabledCount;
    const kwh = totalMinutes * 0.01;
    const price = kwh * 0.2;

    return {
        enable_count: enabledCount,
        total_enabled_time: totalMinutes,
        average_enabled_time: avgMinutes,
        electricity_consumption: parseFloat(kwh.toFixed(2)),
        electricity_price: parseFloat(price.toFixed(2)),
    };
};

type DeviceAnalyticsBlockProps = {
    title: string;
    analytics: DeviceAnalytics;
}

const DeviceAnalyticsBlock = ({title, analytics}: DeviceAnalyticsBlockProps) => {
    return (
        <Card key={title} withBorder radius="md" shadow="xs" mb="lg" p="md">
            <Title order={4} mb="sm">{title}</Title>
            <Grid>
                <Grid.Col span={6}>
                    <Text>Times Enabled</Text>
                    <Text fw={500}>{analytics.enable_count}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                    <Text>Total Enabled Time</Text>
                    <Text fw={500}>{formatSeconds(analytics.total_enabled_time)}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                    <Text>Average Enabled Time</Text>
                    <Text fw={500}>{formatSeconds(Math.round(analytics.average_enabled_time))}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                    <Text>Electricity Consumption</Text>
                    <Text fw={500}>{analytics.electricity_consumption} kWh</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                    <Text>Electricity Price</Text>
                    <Text fw={500}>${analytics.electricity_price}</Text>
                </Grid.Col>
            </Grid>
        </Card>
    )
}

const DeviceAnalyticsPage: React.FC = () => {
    const { deviceId } = useParams();
    const [thisMonth, setThisMonth] = useState<DeviceAnalytics | null>(null);
    const [last28Days, setLast28Days] = useState<DeviceAnalytics | null>(null);

    useEffect(() => {
        setThisMonth(generateAnalytics());
        setLast28Days(generateAnalytics());
    }, [deviceId]);

    return (
        <Container size="sm" py="md">
            <Title order={2} mb="md">Device Analytics</Title>

            {thisMonth && <DeviceAnalyticsBlock title="This Month" analytics={thisMonth}/>}
            {last28Days && <DeviceAnalyticsBlock title="Last 28 Days" analytics={last28Days}/>}

            <Space h="xl" />
        </Container>
    );
};

export default DeviceAnalyticsPage;
