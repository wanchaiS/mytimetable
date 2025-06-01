import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import emailjs from "@emailjs/browser";
import { Mail } from "lucide-react";
import { useState } from "react";

export function ContactUs() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<null | "success" | "error">(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      if (!feedback.trim()) {
        setOpen(false);
        return;
      }
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          title: "Feedback",
          name,
          email,
          time: new Date().toLocaleString(),
          message: feedback,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      );
      setStatus("success");
      setFeedback("");
    } catch (error) {
      console.error("Error sending feedback", error);
      setStatus("error");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  if (!open)
    return (
      <Button onClick={() => setOpen(true)} variant="outline">
        <Mail className="h-4 w-4" /> Send Feedback
      </Button>
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            We appreciate every feedback!
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            placeholder="Name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <textarea
            className="w-full rounded-md border p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            rows={5}
            placeholder="Let us know your thoughts..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
          />
          <Button
            type="submit"
            disabled={loading || !feedback.trim()}
            className="w-full"
          >
            {loading ? "Sending..." : "Send Feedback"}
          </Button>
          {status === "success" && (
            <div className="text-center text-green-600">
              Thank you for your feedback!
            </div>
          )}
          {status === "error" && (
            <div className="text-center text-red-600">
              Something went wrong. Please try again.
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
