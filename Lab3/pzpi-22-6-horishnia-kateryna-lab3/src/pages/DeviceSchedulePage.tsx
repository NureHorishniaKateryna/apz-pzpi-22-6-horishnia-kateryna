import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router';
import {Button, Card, Container, Divider, Group, Modal, Stack, Title,} from '@mantine/core';
import {TimeInput} from "@mantine/dates";
import {useDisclosure} from "@mantine/hooks";
import {useDispatch, useSelector} from "react-redux";
import type {AppDispatch, RootState} from "../store.ts";
import {createSchedule, deleteSchedule, fetchDeviceSchedule} from "../reducers/device_schedule_reducer.ts";
import {unwrapResult} from "@reduxjs/toolkit";

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
    const dispatch = useDispatch<AppDispatch>();
    const schedules = useSelector((state: RootState) => state.schedule.list);
    const [modalOpened, { open, close }] = useDisclosure(false);
    const [newStartTime, setNewStartTime] = useState("12:34");
    const [newEndTime, setNewEndTime] = useState("23:45");

    useEffect(() => {
        dispatch(fetchDeviceSchedule(Number(deviceId)));
    }, [deviceId]);

    const handleAdd = () => {
        dispatch(createSchedule({
            deviceId: Number(deviceId),
            start: fromHHmm(newStartTime),
            end: fromHHmm(newEndTime),
        }))
            .then(unwrapResult)
            .then(result => {
                if (!result.result) return;
                close();
            });
    };

    const handleDelete = (id: number) => {
        dispatch(deleteSchedule({deviceId: Number(deviceId), scheduleId: id}))
            .then(unwrapResult)
            .then(result => {
                if(!result.result) return;
                dispatch(fetchDeviceSchedule(Number(deviceId)));
            });
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
