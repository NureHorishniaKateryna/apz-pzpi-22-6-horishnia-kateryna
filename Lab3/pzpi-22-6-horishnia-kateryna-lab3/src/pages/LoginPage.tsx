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
import {useDispatch} from "react-redux";
import type {AppDispatch} from "../store.ts";
import {login, type AuthError, fetchUser} from "../reducers/auth_reducer.ts";
import {unwrapResult} from "@reduxjs/toolkit";

const LoginPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [dialogMessage, setDialogMessage] = useState("");
    const [opened, { open, close }] = useDisclosure(false);
    const navigate = useNavigate();

    const showDialog = (message: string) => {
        setDialogMessage(message);
        open();
    };

    const onLogin = () => {
        if (!email || !password) return showDialog("Email and password are required.");

        dispatch(login({email: email, password: password}))
            .then(unwrapResult)
            .then(result => {
                const {status, json} = result;
                if(status >= 500)
                    return showDialog("Server error.");
                if(status >= 400)
                    return showDialog((json as AuthError).error);

                dispatch(fetchUser())
                    .then(unwrapResult)
                    .then(result => {
                        const {success, error} = result;
                        if(!success)
                            return showDialog(error!);
                        navigate("/devices");
                    });
            });
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
                <Button onClick={onLogin}>Login</Button>
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
