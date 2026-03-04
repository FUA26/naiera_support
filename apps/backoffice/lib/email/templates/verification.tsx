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

interface VerificationEmailProps {
  userName?: string;
  token: string;
  appIdUrl: string;
}

export function VerificationEmail({ userName, token, appIdUrl }: VerificationEmailProps) {
  const verifyUrl = `${appIdUrl}/verify?token=${token}`;

  return (
    <Html>
      <Head />
      <Preview>Verify your email address</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Verify Your Email</Heading>
          <Text style={text}>{userName ? `Hi ${userName},` : "Hello,"}</Text>
          <Text style={text}>Please verify your email address by clicking the button below:</Text>
          <Button href={verifyUrl} style={button}>
            Verify Email
          </Button>
          <Text style={text}>
            Or use this verification code: <strong>{token}</strong>
          </Text>
          <Text style={footer}>If you didn&apos;t request this, please ignore this email.</Text>
        </Container>
      </Body>
    </Html>
  );
}

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
