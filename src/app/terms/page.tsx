
import { LandingFooter } from "@/components/layout/landing-footer";
import { LandingHeader } from "@/components/layout/landing-header";
import { FileText } from "lucide-react";

export default function TermsPage() {
    return (
        <div className="bg-background text-foreground">
            <LandingHeader />
            <main className="container mx-auto px-4 py-24 sm:py-32">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="mx-auto w-fit p-4 bg-primary/10 rounded-full border border-primary/20 mb-6">
                            <FileText className="h-10 w-10 text-primary" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight gradient-text">Terms of Use</h1>
                        <p className="text-muted-foreground mt-4 text-lg">Last updated: {new Date().toLocaleDateString()}</p>
                    </div>
                    <article className="prose prose-invert prose-lg max-w-none text-muted-foreground prose-h2:gradient-text prose-h2:text-3xl prose-a:text-primary hover:prose-a:text-accent">
                        <h2>1. Acceptance of Terms</h2>
                        <p>By accessing and using the Brahma AI platform ("Service"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services. Any participation in this service will constitute acceptance of this agreement.</p>
                        
                        <h2>2. Description of Service</h2>
                        <p>Brahma provides users with a multimodal AI assistant capable of text extraction, summarization, and interactive chat. The Service is provided "as is" and is constantly evolving. You acknowledge and agree that the form and nature of the Service which Brahma provides may change from time to time without prior notice to you.</p>

                        <h2>3. User Conduct and Responsibilities</h2>
                        <p>You agree to use the Service only for purposes that are permitted by these Terms and any applicable law, regulation, or generally accepted practices. You are solely responsible for any data, text, or other content that you upload, post, or otherwise transmit via the Service. You agree not to engage in any activity that interferes with or disrupts the Service.</p>
                        
                        <h2>4. Intellectual Property</h2>
                        <p>The Service and its original content, features, and functionality are and will remain the exclusive property of Brahma AI and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Brahma AI.</p>
                        
                        <h2>5. Termination</h2>
                        <p>We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.</p>
                        
                        <h2>6. Limitation of Liability</h2>
                        <p>In no event shall Brahma AI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>

                        <h2>7. Governing Law</h2>
                        <p>These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which Brahma AI is based, without regard to its conflict of law provisions.</p>
                    </article>
                </div>
            </main>
            <LandingFooter />
        </div>
    );
}
