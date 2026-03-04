import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";

interface WelcomeEmailProps {
  userName: string;
  appName: string;
  appIdUrl: string;
}

export function WelcomeEmail({ userName, appName, appIdUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to {appName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to {appName}!</Heading>
          <Text style={text}>Hi {userName},</Text>
          <Text style={text}>
            We&apos;re excited to have you on board. Your account has been created successfully.
          </Text>
          <Text style={text}>Get started by visiting your dashboard:</Text>
          <a href={appIdUrl} style={link}>
            Go to Dashboard
          </a>
          <Text style={footer}>If you have any questions, feel free to reach out.</Text>
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

const link = {
  backgroundColor: "#5468ff",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  padding: "12px 24px",
  textDecoration: "none" as const,
  borderRadius: "4px",
  display: "inline-block",
  margin: "0 0 20px",
};

const footer = {
  color: "#888",
  fontSize: "14px",
  margin: "40px 0 0",
};
