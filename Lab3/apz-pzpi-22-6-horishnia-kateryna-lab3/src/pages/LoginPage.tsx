import React, { useState } from "react";
import {
    Container,
    Title,
    TextInput,
    PasswordInput,
    Button,
    Stack, Anchor,
    Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Dialog } from "@mantine/core";
import {Link, useNavigate} from "react-router";

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [dialogMessage, setDialogMessage] = useState('');
    const [opened, { open, close }] = useDisclosure(false);
    const navigate = useNavigate();

    const showDialog = (message: string) => {
        setDialogMessage(message);
        open();
    };

    const login = () => {
        if (!email || !password) {
            showDialog('Email and password are required.');
            return;
        }
        console.log({ email, password });
        navigate("/devices");
    };

    return (
        <Container size="xs" py="md">
            <Title order={2} mb="md">Login</Title>
            <Dialog opened={opened} withCloseButton onClose={close}>
                {dialogMessage}
            </Dialog>
            <Stack>
                <TextInput
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.currentTarget.value)}
                />
                <PasswordInput
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.currentTarget.value)}
                />
                <Button onClick={login}>Login</Button>
                <Text size="sm" mt="sm">
                    Don’t have an account?{" "}
                    <Anchor component={Link} to="/register">
                        Register
                    </Anchor>
                </Text>
            </Stack>
        </Container>
    );
};

export default LoginPage;
