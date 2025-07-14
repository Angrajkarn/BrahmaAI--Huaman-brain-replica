
import { LandingFooter } from "@/components/layout/landing-footer";
import { LandingHeader } from "@/components/layout/landing-header";
import { ShieldCheck } from "lucide-react";

export default function SafetyPage() {
    return (
        <div className="bg-background text-foreground">
            <LandingHeader />
            <main className="container mx-auto px-4 py-24 sm:py-32">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="mx-auto w-fit p-4 bg-primary/10 rounded-full border border-primary/20 mb-6">
                            <ShieldCheck className="h-10 w-10 text-primary" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight gradient-text">Safety, Security & Trust</h1>
                        <p className="text-muted-foreground mt-4 text-lg">Our commitment to responsible AI development.</p>
                    </div>
                    <article className="prose prose-invert prose-lg max-w-none text-muted-foreground prose-h2:gradient-text prose-h2:text-3xl prose-a:text-primary hover:prose-a:text-accent">
                        <h2>Our Approach to Safety</h2>
                        <p>At Brahma AI, safety is not an afterthought; it is a core component of our design and development process. Our mission is to build AI that is not only intelligent but also helpful, harmless, and aligned with human values. We employ a multi-layered safety strategy to mitigate risks and promote positive outcomes.</p>

                        <h2>1. Data Security and Privacy</h2>
                        <p>We understand that the data you entrust to Brahma is sensitive. We employ industry-standard security practices to protect your information:</p>
                        <ul>
                            <li><strong>Encryption:</strong> All your data, including uploaded files and conversations, is encrypted both in transit (using TLS/SSL) and at rest.</li>
                            <li><strong>Access Control:</strong> Strict access controls are enforced to ensure that only authorized personnel can access system infrastructure, and your personal data is not used for any purpose other than providing and improving the service, as outlined in our Privacy Policy.</li>
                            <li><strong>Data Deletion:</strong> You have full control over your data. You can delete individual files, entire conversations, or your entire account at any time. When you delete data, it is permanently removed from our systems.</li>
                        </ul>

                        <h2>2. AI Behavior and Content Moderation</h2>
                        <p>We are dedicated to preventing the generation of harmful, biased, or unsafe content. Brahma's reasoning includes an internal "moral compass" check, a final review step designed to evaluate its own planned response against a set of safety principles before it is shown to you.</p>
                        <p>Our models are trained to avoid generating content that falls into categories such as:</p>
                        <ul>
                            <li>Hate speech or harassment</li>
                            <li>Dangerous or illegal advice</li>
                            <li>Sexually explicit material</li>
                            <li>Content that promotes violence or self-harm</li>
                        </ul>
                        
                        <h2>3. Trust and Transparency</h2>
                        <p>Building trust is paramount. We believe in being transparent about how our systems work. The "How Brahma Thinks" and "Cognitive Architecture" sections of our homepage are part of this commitment. We strive to provide you with a clear understanding of the AI's capabilities and limitations, empowering you to use it effectively and responsibly.</p>
                    </article>
                </div>
            </main>
            <LandingFooter />
        </div>
    );
}
