import React, { useState } from "react";
import {
    Container,
    Title,
    TextInput,
    PasswordInput,
    Button,
    Stack,
    Dialog, Anchor, Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {Link, useNavigate} from "react-router";
import {type AuthError, fetchUser, register} from "../reducers/auth_reducer.ts";
import {unwrapResult} from "@reduxjs/toolkit";
import {useDispatch} from "react-redux";
import type {AppDispatch} from "../store.ts";

const RegisterPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [dialogMessage, setDialogMessage] = useState('');
    const [opened, { open, close }] = useDisclosure(false);
    const navigate = useNavigate();

    const showDialog = (message: string) => {
        setDialogMessage(message);
        open();
    };

    const onRegister = () => {
        if (!email || !password || !repeatPassword || !firstName || !lastName)
            return showDialog("All fields are required.");
        if (password !== repeatPassword)
            return showDialog("Passwords do not match.");

        dispatch(register({email: email, password: password, first_name: firstName, last_name: lastName}))
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
            <Title order={2} mb="md">Register</Title>
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
                <TextInput
                    label="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.currentTarget.value)}
                />
                <TextInput
                    label="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.currentTarget.value)}
                />
                <PasswordInput
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.currentTarget.value)}
                />
                <PasswordInput
                    label="Repeat Password"
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.currentTarget.value)}
                />
                <Button onClick={onRegister}>Register</Button>
                <Text size="sm" mt="sm">
                    Already have an account?{" "}
                    <Anchor component={Link} to="/login">
                        Register
                    </Anchor>
                </Text>
            </Stack>
        </Container>
    );
};

export default RegisterPage;
