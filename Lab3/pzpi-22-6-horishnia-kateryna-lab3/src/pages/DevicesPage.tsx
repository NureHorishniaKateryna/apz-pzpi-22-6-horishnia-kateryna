import {useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import type {AppDispatch, RootState} from "../store";
import {createDevice, fetchDevices} from "../reducers/device_reducer.ts";
import InfiniteScroll from "react-infinite-scroll-component";
import {
    Button,
    Container,
    Dialog,
    Divider,
    Group,
    Loader,
    Modal,
    NumberInput,
    Stack,
    Text,
    TextInput
} from "@mantine/core";
import DeviceInfo from "../components/DeviceComponent.tsx";
import {useDisclosure} from "@mantine/hooks";
import {unwrapResult} from "@reduxjs/toolkit";

const DevicesPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const devices = useSelector((state: RootState) => state.devices.list);
    const devicesInitialized = useRef(false)
    const page = useSelector((state: RootState) => state.devices.page);
    const hasMore = useSelector((state: RootState) => state.devices.hasMore);
    const [modalOpened, { open, close }] = useDisclosure(false);
    const [newName, setNewName] = useState("");
    const [newPrice, setNewPrice] = useState(1.0);
    const [errorMessage, setErrorMessage] = useState("");
    const [errorOpened, { open: errorOpen, close: errorClose }] = useDisclosure(false);

    const showErrorDialog = (message: string) => {
        setErrorMessage(message);
        errorOpen();
    };

    useEffect(() => {
        if (devices.length === 0 && !devicesInitialized.current) {
            devicesInitialized.current = true;
            dispatch(fetchDevices(1));
        }
    }, [dispatch, devices.length]);

    const fetchMoreData = () => dispatch(fetchDevices(page));

    const handleAdd = () => {
        if (!newName || !newPrice) return showErrorDialog("Name and price are required.");

        dispatch(createDevice({name: newName, electricity_price: newPrice}))
            .then(unwrapResult)
            .then(result => {
                const {error} = result;
                if(error !== null)
                    return showErrorDialog(error);
            });
    }

    return (
        <Container py="md" size="100%">
            <Dialog opened={errorOpened} withCloseButton onClose={errorClose}>
                {errorMessage}
            </Dialog>

            <Group justify="space-between">
                <Button onClick={open}>Add Device</Button>
            </Group>

            <Divider my="md" />

            <InfiniteScroll
                dataLength={devices.length}
                next={fetchMoreData}
                hasMore={hasMore}
                loader={<Loader mt="md" />}
                endMessage={<Text ta="center" c="dimmed" mt="md">No more devices</Text>}
            >
                {devices.map((device) => (
                    <DeviceInfo device={device}></DeviceInfo>
                ))}
            </InfiniteScroll>

            <Modal opened={modalOpened} onClose={close} title="Add Device" centered>
                <Stack>
                    <TextInput
                        label="Name"
                        value={newName}
                        onChange={(event) => setNewName(event.currentTarget.value)}
                    />
                    <NumberInput
                        label="Electricity price"
                        value={newPrice}
                        onChange={(event) => setNewPrice(event as number)}
                    />
                    <Group justify="right" mt="sm">
                        <Button onClick={handleAdd}>Add</Button>
                    </Group>
                </Stack>
            </Modal>
        </Container>
    );
};

export default DevicesPage;