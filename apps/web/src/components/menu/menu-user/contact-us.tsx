export default function ContactSection() {
  return (
    <section className="max-w-[1200px] mx-auto py-12 px-6 space-y-12">
      {/* Map */}
      <div className="w-full">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d19801.0533042622!2d-0.15285916407328336!3d51.509865275564075!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48761b333b4c36d1%3A0x4c4571a63b6c2b7f!2sLondon!5e0!3m2!1sen!2suk!4v1687150000000!5m2!1sen!2suk"
          width="100%"
          height="400"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>

      {/* Contact Form */}
      <div className="bg-white rounded-lg p-8 shadow">
        <h2 className="text-2xl font-bold text-center mb-6">Leave a Message</h2>
        <form className="max-w-lg mx-auto space-y-4">
          <input
            type="text"
            placeholder="Name"
            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="text"
            placeholder="Contact number"
            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <textarea
            rows={4}
            placeholder="Message"
            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          ></textarea>
          <div className="text-center">
            <button
              type="submit"
              className="bg-green-700 text-white px-6 py-2 rounded hover:bg-green-800 transition"
            >
              SUBMIT
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
