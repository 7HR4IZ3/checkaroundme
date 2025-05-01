import Hero from "@/components/home/hero";

const ContactUsPage = () => {
  return (
    <>
      <Hero title="Contact Us" subtitles={["Get in touch with us"]} />
      <div className="container mx-auto px-4 py-8">
        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Contact Information</h2>
          <p>No 24D, Green Bay Estate, Lekki, Lagos State, Nigeria</p>
          <p>
            <a
              href="mailto:support@checkaroundme.com"
              className="hover:text-white hover:underline"
            >
              support@checkaroundme.com
            </a>
          </p>
          <p>
            <a
              href="tel:+2349159558854"
              className="hover:text-white hover:underline"
            >
              +234 915 955 8854
            </a>
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Send us a message</h2>
          <form>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Name:
              </label>
              <input
                type="text"
                id="name"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Email:
              </label>
              <input
                type="email"
                id="email"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="message"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Message:
              </label>
              <textarea
                id="message"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              ></textarea>
            </div>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Send
            </button>
          </form>
        </section>
      </div>
    </>
  );
};

export default ContactUsPage;
