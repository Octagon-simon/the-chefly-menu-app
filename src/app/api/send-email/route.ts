import { Resend } from "resend";
import { readFileSync } from "fs";
import { join } from "path";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const { to, subject, template, variables } = await req.json();

    const templatePath = join(process.cwd(), "emails", `${template}.html`);
    const templateHtml = readFileSync(templatePath, "utf-8");

    let rendered = templateHtml;
    Object.entries(variables || {}).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, "g");
      rendered = rendered.replace(placeholder, String(value));
    });

    const { data, error } = await resend.emails.send({
      from: "CheflyMenu <noreply@cheflymenu.app>",
      replyTo: "octagonwebservices@gmail.com",
      to,
      subject: subject || "CheflyMenu Notification",
      html: rendered,
    });

    if (error) return Response.json({ success: false, error }, { status: 400 });

    return Response.json({ success: true, data });
  } catch (err: any) {
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
