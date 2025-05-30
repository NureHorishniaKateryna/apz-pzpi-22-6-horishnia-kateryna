import {Badge, Card, Group, Text} from "@mantine/core";
import {IconPlugConnected, IconPlugConnectedX} from "@tabler/icons-react";
import {Link} from "react-router";
import type {Device} from "../types.ts";

type DeviceInfoProps = {
    device: Device;
}

const DeviceInfo = ({device}: DeviceInfoProps) => {
    return (
        <Card
            key={device.id}
            shadow="sm"
            p="md"
            radius="md"
            withBorder
            mb="sm"
            component={Link}
            to={`/devices/${device.id}`}
        >
            <Group mb="xs">
                <Text fw={500}>{device.name}</Text>
                <Badge color={device.configuration.enabled_manually ? 'green' : 'gray'} variant="light">
                    {device.configuration.enabled_manually ? "On" : "Off"}
                </Badge>
            </Group>
            <Group m="xs">
                {device.configuration.enabled_manually ? (
                    <IconPlugConnected size={20} color="green"/>
                ) : (
                    <IconPlugConnectedX size={20} color="gray"/>
                )}
                <Text size="sm" c="dimmed">
                    Electricity Price: ₴{device.configuration.electricity_price.toFixed(2)} / kWh
                </Text>
            </Group>
        </Card>
    );
};

export default DeviceInfo;