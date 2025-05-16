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

export type AdminDevice = Device & {
    user: User;
}

export type ScheduleItem = {
    id: number;
    start: number;
    end: number;
};

export type DeviceAnalytics = {
    enable_count: number;
    total_enabled_time: number;
    average_enabled_time: number;
    electricity_consumption: number;
    electricity_price: number;
};

export type User = {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    is_admin: boolean;
};
