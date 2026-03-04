import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

interface PasswordResetEmailProps {
  userName?: string;
  token: string;
  appIdUrl: string;
}

export function PasswordResetEmail({ userName, token, appIdUrl }: PasswordResetEmailProps) {
  const resetUrl = `${appIdUrl}/reset-password?token=${token}`;

  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Reset Your Password</Heading>
          <Text style={text}>{userName ? `Hi ${userName},` : "Hello,"}</Text>
          <Text style={text}>
            We received a request to reset your password. Click the button below to create a new
            password:
          </Text>
          <Button href={resetUrl} style={button}>
            Reset Password
          </Button>
          <Text style={text}>This link will expire in 1 hour.</Text>
          <Text style={footer}>If you didn&apos;t request this, please ignore this email.</Text>
        </Container>
      </Body>
    </Html>
  );
}

// Reuse styles from verification email
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: "system-ui, -apple-system, sans-serif",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "600px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 0 20px",
  textAlign: "center" as const,
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 20px",
};

const button = {
  backgroundColor: "#5468ff",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  padding: "12px 24px",
  textDecoration: "none" as const,
  borderRadius: "4px",
  display: "block",
  textAlign: "center" as const,
  margin: "0 0 20px",
};

const footer = {
  color: "#888",
  fontSize: "14px",
  margin: "40px 0 0",
};
