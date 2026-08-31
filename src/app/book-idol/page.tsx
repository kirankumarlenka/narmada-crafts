"use client";

import { useState } from "react";
import { Sparkles, Send, CheckCircle2, Phone, Mail, User, MapPin, Building2, Ruler } from "lucide-react";

export default function BookIdolPage() {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [idolType, setIdolType] = useState("");
  const [height, setHeight] = useState("");
  const [templeName, setTempleName] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          phone,
          email,
          idolType,
          height,
          templeName,
          location,
          notes,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setCustomerName("");
        setPhone("");
        setEmail("");
        setIdolType("");
        setHeight("");
        setTempleName("");
        setLocation("");
        setNotes("");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to submit booking");
      }
    } catch {
      alert("Submission error. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-amber-950 flex items-center justify-center gap-2">
          <Sparkles className="text-amber-600 w-7 h-7" /> Book Your Custom Deity Idol
        </h1>
        <p className="text-stone-600 text-sm">
          Submit your requirements for custom stone craftsmanship, lingams, and temple sculptures. Our master artisans will contact you with pricing and timelines.
        </p>
      </div>

      {success ? (
        <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h2 className="text-xl font-bold text-emerald-950">Booking Inquiry Received!</h2>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
            Thank you for reaching out. We have logged your request and our team will get in touch with you shortly.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="px-5 py-2 bg-amber-800 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition"
          >
            Submit Another Request
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-md space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-stone-400" /> Full Name *
              </label>
              <input
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Ramesh Sharma"
                className="w-full p-2.5 border rounded-lg text-sm mt-1 bg-stone-50/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-stone-400" /> Phone Number *
              </label>
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full p-2.5 border rounded-lg text-sm mt-1 bg-stone-50/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-stone-400" /> Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ramesh@example.com"
                className="w-full p-2.5 border rounded-lg text-sm mt-1 bg-stone-50/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700">Deity / Idol Type *</label>
              <input
                required
                value={idolType}
                onChange={(e) => setIdolType(e.target.value)}
                placeholder="e.g. Narmadeshwar Shivling, Ganesha"
                className="w-full p-2.5 border rounded-lg text-sm mt-1 bg-stone-50/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-stone-400" /> Required Height
              </label>
              <input
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="e.g. 3.5 Feet / 24 Inches"
                className="w-full p-2.5 border rounded-lg text-sm mt-1 bg-stone-50/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-stone-400" /> Temple / Ashram Name
              </label>
              <input
                value={templeName}
                onChange={(e) => setTempleName(e.target.value)}
                placeholder="Optional"
                className="w-full p-2.5 border rounded-lg text-sm mt-1 bg-stone-50/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-400" /> Delivery City / State
              </label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Indore, MP"
                className="w-full p-2.5 border rounded-lg text-sm mt-1 bg-stone-50/50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700">Specific Customization / Details</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Mention details about stone preference, polish type, delivery deadline..."
              className="w-full p-2.5 border rounded-lg text-sm mt-1 bg-stone-50/50"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-amber-800 hover:bg-amber-700 text-white py-3 rounded-lg text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
          >
            <Send className="w-4 h-4" />
            {submitting ? "Submitting Booking Inquiry..." : "Submit Idol Booking Inquiry"}
          </button>
        </form>
      )}
    </div>
  );
}