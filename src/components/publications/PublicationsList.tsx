'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { Publication } from '@/types/publication';
import { PublicationPageConfig } from '@/types/page';
import { cn } from '@/lib/utils';
import { useMessages } from '@/lib/i18n/useMessages';
import FormattedBibTeXText from './FormattedBibTeXText';

interface PublicationsListProps {
    config: PublicationPageConfig;
    publications: Publication[];
    embedded?: boolean;
}

export default function PublicationsList({ publications, embedded = false }: PublicationsListProps) {
    const messages = useMessages();
    const [searchQuery] = useState('');
    const [selectedYear] = useState<number | 'all'>('all');
    const [selectedType] = useState<string | 'all'>('all');
    const [expandedAbstractId, setExpandedAbstractId] = useState<string | null>(null);

    // Filter publications
    const filteredPublications = useMemo(() => {
        return publications.filter(pub => {
            const matchesSearch =
                pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pub.authors.some(author => author.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                pub.journal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pub.conference?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesYear = selectedYear === 'all' || pub.year === selectedYear;
            const matchesType = selectedType === 'all' || pub.type === selectedType;

            return matchesSearch && matchesYear && matchesType;
        });
    }, [publications, searchQuery, selectedYear, selectedType]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
        >




            {/* Publications Grid */}
            <div className="space-y-12">
                {filteredPublications.length === 0 ? (
                    <div className="text-center py-12 text-neutral-500">
                        {messages.publications.noResults}
                    </div>
                ) : (
                    <>
                        {/* Working Papers Section */}
                        {filteredPublications.filter(pub => !pub.description?.toLowerCase().includes('paper in progress')).length > 0 && (
                            <div className="space-y-4">
                                <h2 className="text-2xl font-serif font-bold text-primary mb-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">Working Papers</h2>
                                <div className="space-y-0">
                                    {filteredPublications.filter(pub => !pub.description?.toLowerCase().includes('paper in progress')).map((pub, index) => (
                                        <motion.div
                                            key={pub.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: 0.05 * index }}
                                            className="py-3 border-b border-neutral-100 dark:border-neutral-800 last:border-0"
                                        >
                                            <div className="flex flex-col md:flex-row gap-6">
                                                {pub.preview && (
                                                    <div className="w-full md:w-48 flex-shrink-0">
                                                        <div className="aspect-video md:aspect-[4/3] relative rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                                                            <Image
                                                                src={`/papers/${pub.preview}`}
                                                                alt={pub.title}
                                                                fill
                                                                className="object-cover"
                                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex-grow">
                                                    <h3 className={`${embedded ? "text-base" : "text-lg"} font-semibold text-primary mb-2 leading-tight`}>
                                                        <FormattedBibTeXText nodes={pub.titleNodes} fallback={pub.title} />
                                                    </h3>
                                                    <p className={`${embedded ? "text-sm" : "text-base"} text-neutral-600 dark:text-neutral-400 mb-2`}>
                                                        {pub.authors.map((author, idx) => (
                                                            <span key={idx}>
                                                                <span className={`${author.isHighlighted ? 'font-semibold text-accent' : ''} ${author.isCoAuthor ? `underline underline-offset-4 ${author.isHighlighted ? 'decoration-accent' : 'decoration-neutral-400'}` : ''}`}>
                                                                    {author.name}
                                                                </span>
                                                                {author.isCorresponding && (
                                                                    <sup className={`ml-0 ${author.isHighlighted ? 'text-accent' : 'text-neutral-600 dark:text-neutral-400'}`}>†</sup>
                                                                )}
                                                                {idx < pub.authors.length - 1 && ', '}
                                                            </span>
                                                        ))}
                                                    </p>
                                                    <p className="text-sm font-medium text-neutral-800 dark:text-neutral-600 mb-3">
                                                        {pub.journal || pub.conference} {pub.year}
                                                    </p>
                
                                                    {pub.description && !pub.description.toLowerCase().includes('paper in progress') && (
                                                        <p className="text-sm text-neutral-600 dark:text-neutral-500 mb-4 line-clamp-3">
                                                            {pub.description}
                                                        </p>
                                                    )}
                
                                                    <div className="flex flex-wrap gap-2 mt-auto">
                                                        {pub.doi && (
                                                            <a
                                                                href={`https://doi.org/${pub.doi}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white transition-colors"
                                                            >
                                                                DOI
                                                            </a>
                                                        )}
                                                        {pub.code && (
                                                            <a
                                                                href={pub.code}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white transition-colors"
                                                            >
                                                                {messages.publications.code}
                                                            </a>
                                                        )}
                                                        {pub.abstract && (
                                                            <button
                                                                onClick={() => setExpandedAbstractId(expandedAbstractId === pub.id ? null : pub.id)}
                                                                className={cn(
                                                                    "inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors",
                                                                    expandedAbstractId === pub.id
                                                                        ? "bg-accent text-white"
                                                                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white"
                                                                )}
                                                            >
                                                                <DocumentTextIcon className="h-3 w-3 mr-1.5" />
                                                                {messages.publications.abstract}
                                                            </button>
                                                        )}
                                                    </div>
                
                                                    <AnimatePresence>
                                                        {expandedAbstractId === pub.id && pub.abstract ? (
                                                            <motion.div
                                                                key="abstract"
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                className="overflow-hidden mt-4"
                                                            >
                                                                <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
                                                                    <p className="text-sm text-neutral-600 dark:text-neutral-500 leading-relaxed">
                                                                        {pub.abstract}
                                                                    </p>
                                                                </div>
                                                            </motion.div>
                                                        ) : null}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Papers in Progress Section */}
                        {filteredPublications.filter(pub => pub.description?.toLowerCase().includes('paper in progress')).length > 0 && (
                            <div className="space-y-4">
                                <h2 className="text-2xl font-serif font-bold text-primary mb-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">Paper in Progress</h2>
                                <div className="space-y-0">
                                    {filteredPublications.filter(pub => pub.description?.toLowerCase().includes('paper in progress')).map((pub, index) => (
                                        <motion.div
                                            key={pub.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: 0.05 * index }}
                                            className="py-3 border-b border-neutral-100 dark:border-neutral-800 last:border-0"
                                        >
                                            <div className="flex flex-col md:flex-row gap-6">
                                                {pub.preview && (
                                                    <div className="w-full md:w-48 flex-shrink-0">
                                                        <div className="aspect-video md:aspect-[4/3] relative rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                                                            <Image
                                                                src={`/papers/${pub.preview}`}
                                                                alt={pub.title}
                                                                fill
                                                                className="object-cover"
                                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex-grow">
                                                    <h3 className={`${embedded ? "text-base" : "text-lg"} font-semibold text-primary mb-2 leading-tight`}>
                                                        <FormattedBibTeXText nodes={pub.titleNodes} fallback={pub.title} />
                                                    </h3>
                                                    <p className={`${embedded ? "text-sm" : "text-base"} text-neutral-600 dark:text-neutral-400 mb-2`}>
                                                        {pub.authors.map((author, idx) => (
                                                            <span key={idx}>
                                                                <span className={`${author.isHighlighted ? 'font-semibold text-accent' : ''} ${author.isCoAuthor ? `underline underline-offset-4 ${author.isHighlighted ? 'decoration-accent' : 'decoration-neutral-400'}` : ''}`}>
                                                                    {author.name}
                                                                </span>
                                                                {author.isCorresponding && (
                                                                    <sup className={`ml-0 ${author.isHighlighted ? 'text-accent' : 'text-neutral-600 dark:text-neutral-400'}`}>†</sup>
                                                                )}
                                                                {idx < pub.authors.length - 1 && ', '}
                                                            </span>
                                                        ))}
                                                    </p>
                                                    <p className="text-sm font-medium text-neutral-800 dark:text-neutral-600 mb-3">
                                                        {pub.journal || pub.conference} {pub.year}
                                                    </p>
                
                                                    {pub.description && !pub.description.toLowerCase().includes('paper in progress') && (
                                                        <p className="text-sm text-neutral-600 dark:text-neutral-500 mb-4 line-clamp-3">
                                                            {pub.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </motion.div>
    );
}
