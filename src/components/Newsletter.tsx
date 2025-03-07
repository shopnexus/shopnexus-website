import { useState } from "react"
import Button  from "./ui/Button"
import Input  from "./ui/Input"

export default function Newsletter() {
    const [email, setEmail]=useState("")

    return (
        <section className="w-full max-w-7xl mx-auto mt-24 bg-gray-100 p-12 rounded-lg">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">Subscribe to Our Newsletter</h2>
        <p className="text-lg text-gray-600 mb-6">Stay updated with our latest styles and offers.</p>
        <form className="flex gap-4">
            <Input label="email" value="adu" type="email" onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="flex-grow" />
            <Button type="submit">Subscribe</Button>
        </form>
        </section>
    )
}


