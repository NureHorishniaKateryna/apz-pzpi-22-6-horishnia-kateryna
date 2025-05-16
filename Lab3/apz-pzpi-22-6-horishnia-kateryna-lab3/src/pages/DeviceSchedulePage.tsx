import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import {
    Container,
    Title,
    Group,
    Button,
    Card,
    Divider, Modal, Stack,
} from '@mantine/core';
import {TimeInput} from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import type {ScheduleItem} from "../types.ts";

const generateFakeSchedules = (count: number): ScheduleItem[] => {
    return Array.from({ length: count }, () => {
        const start = Math.floor(Math.random()*(86400 - 60 * 60));
        const end = start + Math.floor(Math.random() * 60 * 60);
        return {
            id: (Date.now() % 86400_000) * 1000 + Math.floor(Math.random() * 1000_000),
            start: start,
            end: end,
        };
    });
};

const toHHmm = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

const fromHHmm = (time: string) => {
    const [hours, minutes] = time.split(":");
    return Number(hours) * 3600 + Number(minutes) * 60;
}

const DeviceSchedulePage: React.FC = () => {
    const { deviceId } = useParams();
    const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
    const [modalOpened, { open, close }] = useDisclosure(false);
    const [newStartTime, setNewStartTime] = useState("12:34");
    const [newEndTime, setNewEndTime] = useState("23:45");

    useEffect(() => {
        const fakeSchedules = generateFakeSchedules(3);
        setSchedules(fakeSchedules);
    }, [deviceId]);

    const handleAdd = () => {
        const newItem: ScheduleItem = {
            id: (Date.now() % 86400_000) * 1000 + Math.floor(Math.random() * 1000_000),
            start: fromHHmm(newStartTime),
            end: fromHHmm(newEndTime),
        };
        setSchedules((prev) => [...prev, newItem]);
        close()
    };

    const handleDelete = (id: number) => {
        setSchedules((prev) => prev.filter((item) => item.id !== id));
    };

    return (
        <Container size="sm" py="md">
            <Title order={2} mb="md">Device Schedule</Title>

            {schedules.map((item) => (
                <Card key={item.id} withBorder mb="sm" radius="md" p="md">
                    <Group grow mb="xs">
                        <TimeInput
                            label="Start Time"
                            value={toHHmm(item.start)}
                            disabled
                        />
                        <TimeInput
                            label="End Time"
                            value={toHHmm(item.end)}
                            disabled
                        />
                    </Group>
                    <Group justify="right">
                        <Button color="red" variant="outline" onClick={() => handleDelete(item.id)}>
                            Delete
                        </Button>
                    </Group>
                </Card>
            ))}

            <Divider my="md" />

            <Group justify="space-between">
                <Button onClick={open}>Add Schedule</Button>
            </Group>

            <Modal opened={modalOpened} onClose={close} title="Add Schedule" centered>
                <Stack>
                    <TimeInput
                        label="Start Time"
                        value={newStartTime}
                        onChange={(event) => setNewStartTime(event.currentTarget.value)}
                    />
                    <TimeInput
                        label="End Time"
                        value={newEndTime}
                        onChange={(event) => setNewEndTime(event.currentTarget.value)}
                    />
                    <Group justify="right" mt="sm">
                        <Button onClick={handleAdd}>Add</Button>
                    </Group>
                </Stack>
            </Modal>
        </Container>
    );
};

export default DeviceSchedulePage;
