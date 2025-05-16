export type DeviceConfig = {
    device_id: number;
    enabled_manually: boolean;
    enabled_auto: boolean;
    electricity_price: number;
}

export type Device = {
    id: number;
    name: string;
    api_key: string;
    configuration: DeviceConfig;
};

export type ScheduleItem = {
    id: number;
    start: number;
    end: number;
};
