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

const RegisterPage: React.FC = () => {
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

    const register = () => {
        if (!email || !password || !repeatPassword || !firstName || !lastName) {
            showDialog("All fields are required.");
            return;
        }
        if (password !== repeatPassword) {
            showDialog("Passwords do not match.");
            return;
        }

        console.log({
            email,
            password,
            first_name: firstName,
            last_name: lastName,
        });

        navigate("/devices");
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
                <Button onClick={register}>Register</Button>
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
