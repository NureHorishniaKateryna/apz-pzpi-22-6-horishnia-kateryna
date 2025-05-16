import React, {type ReactNode } from 'react';
import {
    AppShell,
    NavLink,
    ScrollArea,
    Stack,
    Text,
    Group,
    Box, Burger, Divider, UnstyledButton, Avatar, Menu,
} from "@mantine/core";
import { Link, useLocation } from "react-router";
import {useDisclosure} from "@mantine/hooks";
import {IconLogout} from "@tabler/icons-react";

type AppLayoutProps = {
    children: ReactNode;
};

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    const location = useLocation();
    const [opened, { toggle }] = useDisclosure();

    const links = [
        { label: "Devices", to: "/devices" },
        // TODO: only show admin pages if user is admin
        { label: "Admin Users", to: "/admin/users" },
        { label: "Admin Devices", to: "/admin/devices" },
    ];

    const isActive = (to: string) => location.pathname.startsWith(to);

    return (
        <AppShell
            padding="md"
            navbar={{
                width: "240px",
                breakpoint: "sm",
                collapsed: { mobile: !opened },
            }}
        >
            <AppShell.Header>
                <Burger
                    opened={opened}
                    onClick={toggle}
                    hiddenFrom="sm"
                    size="sm"
                />
            </AppShell.Header>

            <AppShell.Navbar p="sm">
                <AppShell.Section grow component={ScrollArea}>
                    <Stack gap="xs">
                        {links.map((link) => (
                            <NavLink
                                key={link.to}
                                label={link.label}
                                component={Link}
                                to={link.to}
                                active={isActive(link.to)}
                            />
                        ))}
                    </Stack>
                </AppShell.Section>
                <AppShell.Section>
                    <Divider mb="sm" />
                    <Menu withArrow position="top-start" shadow="md">
                        <Menu.Target>
                            <UnstyledButton w="100%">
                                <Group wrap="nowrap" px="xs" py="sm">
                                    <Avatar radius="xl" />
                                    <Box>
                                        <Text size="sm" fw={500}>
                                            {"TODO: user name"}
                                        </Text>
                                    </Box>
                                </Group>
                            </UnstyledButton>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item
                                leftSection={<IconLogout size={16} />}
                                color="red"
                                onClick={() => console.log("TODO: log out")}
                            >
                                Logout
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </AppShell.Section>
            </AppShell.Navbar>

            <AppShell.Main>
                {children}
            </AppShell.Main>
        </AppShell>
    );
};

export default AppLayout;
