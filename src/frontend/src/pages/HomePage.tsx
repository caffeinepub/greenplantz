import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, Droplet, Sun } from 'lucide-react';
import { useGetFullCategoryTaxonomy } from '../hooks/storefront/useFullCategoryTaxonomy';
import { getTopLevelCategories } from '../utils/categoryTaxonomy';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const { data: taxonomy, isLoading } = useGetFullCategoryTaxonomy();
  const topLevelCategories = taxonomy ? getTopLevelCategories(taxonomy) : [];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-accent/10 to-background">
        <div className="container-custom py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Grow Your <span className="text-primary">Green</span> Paradise
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                Discover premium plants, quality soil, and everything you need to create your perfect garden oasis.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg">
                  <Link to="/catalog">Shop Now</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/catalog">Browse Collection</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-64 md:h-96 rounded-lg overflow-hidden shadow-soft">
              <img
                src="/assets/generated/greenplantz-hero.dim_1600x600.png"
                alt="Beautiful garden plants"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/30">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <Leaf className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Premium Quality</h3>
                <p className="text-sm text-muted-foreground">
                  Hand-selected plants and supplies for your garden
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <Droplet className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Expert Care Tips</h3>
                <p className="text-sm text-muted-foreground">
                  Detailed care instructions with every purchase
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <Sun className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Sustainable</h3>
                <p className="text-sm text-muted-foreground">
                  Eco-friendly products and practices
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Shop by Category</h2>
            <p className="text-muted-foreground">Find exactly what you need for your garden</p>
          </div>
          
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {topLevelCategories.map((category) => (
                <Link key={category.id.toString()} to="/catalog" search={{ category: category.id.toString() }}>
                  <Card className="group hover:shadow-lg transition-all cursor-pointer h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Leaf className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                            {category.name}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {category.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
