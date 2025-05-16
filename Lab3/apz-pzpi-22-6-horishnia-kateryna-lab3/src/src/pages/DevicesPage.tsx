import {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import type {AppDispatch, RootState} from "../store";
import {fetchDevices} from "../reducers/device_reducer.ts";
import InfiniteScroll from "react-infinite-scroll-component";
import {Container, Loader, Text} from "@mantine/core";
import DeviceInfo from "../components/DeviceComponent.tsx";

const DevicesPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const devices = useSelector((state: RootState) => state.devices.list);
    const page = useSelector((state: RootState) => state.devices.page);
    const hasMore = useSelector((state: RootState) => state.devices.hasMore);

    useEffect(() => {
        if (devices.length === 0) {
            dispatch(fetchDevices(1));
        }
    }, [dispatch, devices.length]);

    const fetchMoreData = () => dispatch(fetchDevices(page));

    return (
        <Container py="md" size="100%">
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
        </Container>
    );
};

export default DevicesPage;