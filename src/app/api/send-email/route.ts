import { Resend } from "resend";
import { readFileSync } from "fs";
import { join } from "path";
import Handlebars from "handlebars";
import { getUser } from "../lib/subscription";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const { to, userId, subject, template, variables } = await req.json();

    // Resolve receiver email
    let receiver: string = to;
    if (typeof userId !== "undefined" && userId?.trim() !== "") {
      const user = await getUser(userId);
      receiver = user?.email || to;
    }

    // Load template (still .html)
    const templatePath = join(process.cwd(), "emails", `${template}.html`);
    const templateSource = readFileSync(templatePath, "utf-8");

    // Compile with Handlebars
    const compiledTemplate = Handlebars.compile(templateSource);
    const renderedHtml = compiledTemplate(variables || {});

    // Send via Resend
    const { data, error } = await resend.emails.send({
      from: "CheflyMenu <noreply@cheflymenu.app>",
      replyTo: "octagonwebservices@gmail.com",
      to: receiver,
      subject: subject || "CheflyMenu Notification",
      html: renderedHtml,
    });

    if (error) {
      return Response.json({ success: false, error }, { status: 400 });
    }

    return Response.json({ success: true, data });
  } catch (err: any) {
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
