import React, { useState, useMemo } from 'react';
import { FaSearch, FaEye, FaTag, FaBookOpen, FaQuestionCircle, FaChevronRight } from 'react-icons/fa';

const awarenessArticles = [
    {
        id: 1,
        title: "The Environmental Impact of E-Waste",
        category: "Awareness",
        tags: ["environment", "pollution", "future"],
        views: 1245,
        summary: "Discover how improper disposal of electronics affects our soil and water quality, and why responsible recycling is crucial.",
        content: "Electronic waste, or e-waste, is one of the fastest-growing waste streams in the world. When electronics are thrown in landfills, toxic substances like lead, mercury, and cadmium can leach into the soil and groundwater, posing significant risks to human health and the environment. Responsible recycling through certified facilities ensures these materials are safely recovered and reused."
    },
    {
        id: 2,
        title: "How to Safely Recycle Old Batteries",
        category: "Safety",
        tags: ["batteries", "hazardous", "safety"],
        views: 856,
        summary: "Step-by-step guide to handling different types of batteries, from standard AA to Lithium-ion laptop batteries.",
        content: "Batteries should never be placed in your regular recycling or trash bin. They can cause fires in collection trucks and processing facilities. Tape the terminals of lithium batteries and bring them to a designated battery drop-off point. Most electronics retailers and local waste management centers offer these services for free."
    },
    {
        id: 3,
        title: "What Happens to Your Recycled Electronics?",
        category: "Process",
        tags: ["recycling", "process", "recovery"],
        views: 2103,
        summary: "Take a journey through a recycling facility and see how valuable metals are extracted and repurposed for new products.",
        content: "Once collected, electronics are sorted and then shredded into small pieces. High-tech sensors and magnets separate plastics, glass, and metals like copper, gold, and aluminum. These recovered materials are then melted down and used to manufacture new products, reducing the need for destructive mining operations."
    },
    {
        id: 4,
        title: "Data Security: Wiping Your Devices",
        category: "Security",
        tags: ["privacy", "data", "security"],
        views: 1562,
        summary: "Protect your personal information before you part with your old phones and laptops with our data-clearing checklist.",
        content: "Before recycling any device that stores data, perform a factory reset. For computers, use dedicated disk-wiping software to ensure your personal files cannot be recovered. Removing SIM cards and SD cards is also a vital step in protecting your identity and privacy."
    }
];

const faqs = [
    {
        question: "Is there a fee for recycling my old TV?",
        answer: "Most basic electronic items are free to recycle. However, some larger items like CRT monitors or oversized televisions may have a small handling fee at certain collection centers."
    },
    {
        question: "Can I recycle cracked screens?",
        answer: "Yes, we accept devices with cracked screens. Please ensure they are handled carefully or placed in a protective bag to prevent injury to our collection staff."
    },
    {
        question: "What items are NOT accepted?",
        answer: "We focus on electronics. We generally do not accept large household appliances like refrigerators or washing machines, nor do we accept hazardous non-electronic chemicals."
    }
];

const AwarenessSection = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [viewCounts, setViewCounts] = useState(() => {
        const counts = {};
        awarenessArticles.forEach(a => counts[a.id] = a.views);
        return counts;
    });

    const categories = ['All', ...new Set(awarenessArticles.map(a => a.category))];

    const filteredArticles = useMemo(() => {
        return awarenessArticles.filter(article => {
            const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                article.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchTerm, selectedCategory]);

    const handleArticleClick = (id) => {
        setViewCounts(prev => ({
            ...prev,
            [id]: prev[id] + 1
        }));
    };

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 lg:px-12">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
                        <FaBookOpen className="text-green-600" /> Awareness & Knowledge Base
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Learn how to recycle responsibly, protect the environment, and understand the journey of your old electronics.
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
                    <div className="relative w-full md:max-w-md">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search articles or tags..." 
                            className="input input-bordered w-full pl-12 focus:border-green-500 rounded-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
                        {categories.map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`btn btn-sm rounded-full px-6 ${selectedCategory === cat ? 'btn-success text-white' : 'btn-ghost bg-gray-100 hover:bg-gray-200'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Articles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-20">
                    {filteredArticles.length > 0 ? (
                        filteredArticles.map(article => (
                            <div 
                                key={article.id} 
                                className="card bg-base-100 border border-gray-100 hover:shadow-xl transition-all duration-300 group"
                                onClick={() => handleArticleClick(article.id)}
                            >
                                <div className="card-body p-8">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="badge badge-success badge-outline font-semibold">{article.category}</span>
                                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                                            <FaEye /> {viewCounts[article.id]} views
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-green-600 transition-colors">
                                        {article.title}
                                    </h3>
                                    <p className="text-gray-600 mb-6 leading-relaxed">
                                        {article.summary}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {article.tags.map(tag => (
                                            <span key={tag} className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                                                <FaTag className="text-[10px]" /> {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="card-actions justify-end">
                                        <button className="btn btn-ghost btn-sm text-green-600 font-bold hover:bg-green-50">
                                            Read More <FaChevronRight className="text-xs" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                            <p className="text-gray-500 text-xl font-medium">No articles found matching your search.</p>
                            <button onClick={() => {setSearchTerm(''); setSelectedCategory('All');}} className="btn btn-link text-green-600 mt-2">Clear all filters</button>
                        </div>
                    )}
                </div>

                {/* FAQ Section */}
                <div className="bg-green-50 rounded-[3rem] p-10 lg:p-16">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-4 bg-green-600 rounded-2xl text-white shadow-lg shadow-green-200">
                            <FaQuestionCircle className="text-3xl" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">Frequently Asked Questions</h2>
                            <p className="text-green-700 font-medium">Quick answers to common recycling queries</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {faqs.map((faq, index) => (
                            <div key={index} className="collapse collapse-plus bg-white rounded-2xl shadow-sm border border-green-100">
                                <input type="radio" name="my-accordion-3" defaultChecked={index === 0} /> 
                                <div className="collapse-title text-xl font-bold text-gray-800 pr-12">
                                    {faq.question}
                                </div>
                                <div className="collapse-content"> 
                                    <p className="text-gray-600 leading-relaxed border-t border-gray-50 pt-4 mt-2">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AwarenessSection;
