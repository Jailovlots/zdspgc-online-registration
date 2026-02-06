import { PublicLayout } from "@/components/layout/PublicLayout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Laptop, Activity, Code, Dumbbell, BookOpen, Trophy } from "lucide-react";

export default function Programs() {
    return (
        <PublicLayout>
            {/* Hero Section */}
            <section className="bg-slate-900 text-white py-20 relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-20">
                    {/* Abstract shapes or pattern could go here */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <Badge className="mb-4 bg-secondary text-secondary-foreground hover:bg-secondary/90 px-4 py-1 text-sm rounded-full">
                        Academic Offerings
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 font-serif">
                        Our Academic Programs
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        Discover a curriculum designed to equip you with the skills, knowledge, and values needed to excel in your chosen field.
                    </p>
                </div>
            </section>

            {/* Programs Grid */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4">

                    <div className="grid lg:grid-cols-2 gap-12">

                        {/* BSIS Program */}
                        <div className="flex flex-col">
                            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex-1 flex flex-col hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="h-64 bg-slate-800 relative group overflow-hidden">
                                    <img
                                        src="/assets/images/college-hero.png"
                                        alt="Computer Studies"
                                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                                    <div className="absolute bottom-6 left-6">
                                        <Badge className="bg-blue-500 hover:bg-blue-600 mb-2">College of Computer Studies</Badge>
                                        <h2 className="text-3xl font-bold text-white font-serif">BSIS</h2>
                                        <p className="text-slate-200">Bachelor of Science in Information Systems</p>
                                    </div>
                                </div>

                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="mb-6">
                                        <p className="text-muted-foreground leading-relaxed mb-6">
                                            The BSIS program prepares students to become IT professionals with expert knowledge in the design, implementation, and management of information systems. Bridging the gap between business and technology.
                                        </p>

                                        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <Code className="h-5 w-5 text-blue-500" />
                                            Program Highlights
                                        </h4>
                                        <ul className="space-y-3">
                                            <li className="flex items-start gap-3">
                                                <div className="mt-1 bg-blue-100 p-1 rounded">
                                                    <Laptop className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <span className="text-sm text-slate-600">Software Development & Web Technologies</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <div className="mt-1 bg-blue-100 p-1 rounded">
                                                    <BookOpen className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <span className="text-sm text-slate-600">Database Management & Systems Analysis</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <div className="mt-1 bg-blue-100 p-1 rounded">
                                                    <Trophy className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <span className="text-sm text-slate-600">Capstone Projects & Industry Immersion</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-slate-100">
                                        <Link href="/login?tab=register">
                                            <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white group">
                                                Enroll in BSIS
                                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* BPED Program */}
                        <div className="flex flex-col">
                            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex-1 flex flex-col hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="h-64 bg-slate-800 relative group overflow-hidden">
                                    <img
                                        src="/assets/images/school-prof.jpg"
                                        alt="Physical Education"
                                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                                    <div className="absolute bottom-6 left-6">
                                        <Badge className="bg-orange-500 hover:bg-orange-600 mb-2">College of Teacher Education</Badge>
                                        <h2 className="text-3xl font-bold text-white font-serif">BPED</h2>
                                        <p className="text-slate-200">Bachelor of Physical Education</p>
                                    </div>
                                </div>

                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="mb-6">
                                        <p className="text-muted-foreground leading-relaxed mb-6">
                                            The BPED program is designed to equip students with the skills to teach physical education, sports, and wellness. It fosters a passion for fitness and healthy living, preparing future educators and coaches.
                                        </p>

                                        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <Activity className="h-5 w-5 text-orange-500" />
                                            Program Highlights
                                        </h4>
                                        <ul className="space-y-3">
                                            <li className="flex items-start gap-3">
                                                <div className="mt-1 bg-orange-100 p-1 rounded">
                                                    <Dumbbell className="h-4 w-4 text-orange-600" />
                                                </div>
                                                <span className="text-sm text-slate-600">Sports Science & Coaching</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <div className="mt-1 bg-orange-100 p-1 rounded">
                                                    <BookOpen className="h-4 w-4 text-orange-600" />
                                                </div>
                                                <span className="text-sm text-slate-600">Curriculum Development for PE</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <div className="mt-1 bg-orange-100 p-1 rounded">
                                                    <Trophy className="h-4 w-4 text-orange-600" />
                                                </div>
                                                <span className="text-sm text-slate-600">Athietic Management & Events</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-slate-100">
                                        <Link href="/login?tab=register">
                                            <Button size="lg" className="w-full bg-orange-600 hover:bg-orange-700 text-white group">
                                                Enroll in BPED
                                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="mt-20 text-center">
                        <h3 className="text-2xl font-bold text-slate-900 mb-6 font-serif">More Programs Coming Soon</h3>
                        <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                            ZDSPGC - Dimataling Campus is continuously expanding its academic offerings to serve the community better. Stay tuned for new program announcements.
                        </p>
                        <Link href="/about">
                            <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
                                Learn About Our History
                            </Button>
                        </Link>
                    </div>

                </div>
            </section>
        </PublicLayout>
    );
}
