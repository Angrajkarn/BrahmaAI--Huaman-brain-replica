
import { LandingFooter } from "@/components/layout/landing-footer";
import { LandingHeader } from "@/components/layout/landing-header";
import { Lock } from "lucide-react";

export default function PrivacyPage() {
    return (
        <div className="bg-background text-foreground">
            <LandingHeader />
            <main className="container mx-auto px-4 py-24 sm:py-32">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="mx-auto w-fit p-4 bg-primary/10 rounded-full border border-primary/20 mb-6">
                            <Lock className="h-10 w-10 text-primary" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight gradient-text">Privacy Policy</h1>
                        <p className="text-muted-foreground mt-4 text-lg">Your privacy is important to us. Last updated: {new Date().toLocaleDateString()}</p>
                    </div>
                    <article className="prose prose-invert prose-lg max-w-none text-muted-foreground prose-h2:gradient-text prose-h2:text-3xl prose-a:text-primary hover:prose-a:text-accent">
                        <h2>1. Information We Collect</h2>
                        <p>We collect information to provide better services to all our users. We collect information in the following ways:</p>
                        <ul>
                            <li><strong>Information you give us.</strong> For example, our services require you to sign up for a Brahma Account. When you do, we’ll ask for personal information, like your name, email address, or telephone number to store with your account.</li>
                            <li><strong>Information we get from your use of our services.</strong> We collect information about the services that you use and how you use them. This includes files you upload, queries you make, and your interactions with the AI.</li>
                        </ul>

                        <h2>2. How We Use Information We Collect</h2>
                        <p>We use the information we collect from all of our services to provide, maintain, protect and improve them, to develop new ones, and to protect Brahma and our users. We also use this information to offer you tailored content – like giving you more relevant search results and ads.</p>

                        <h2>3. Information We Share</h2>
                        <p>We do not share personal information with companies, organizations and individuals outside of Brahma AI unless one of the following circumstances applies:</p>
                        <ul>
                            <li><strong>With your consent.</strong> We will share personal information with companies, organizations or individuals outside of Brahma when we have your consent to do so.</li>
                            <li><strong>For legal reasons.</strong> We will share personal information with companies, organizations or individuals outside of Brahma if we have a good-faith belief that access, use, preservation or disclosure of the information is reasonably necessary to meet any applicable law, regulation, legal process or enforceable governmental request.</li>
                        </ul>

                        <h2>4. Data Security</h2>
                        <p>We work hard to protect Brahma and our users from unauthorized access to or unauthorized alteration, disclosure or destruction of information we hold. In particular: We encrypt many of our services using SSL. We review our information collection, storage and processing practices, including physical security measures, to guard against unauthorized access to systems.</p>
                    </article>
                </div>
            </main>
            <LandingFooter />
        </div>
    );
}
