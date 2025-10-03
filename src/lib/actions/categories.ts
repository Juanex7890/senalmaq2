import { 
  getCategoriesCollection, 
  mapCategoryDocument, 
  Category 
} from '@/lib/firebase';
import { query, orderBy, getDocs } from 'firebase/firestore';

export async function getCategories(): Promise<Category[]> {
  try {
    const categoriesRef = getCategoriesCollection();
    const q = query(categoriesRef, orderBy('name'));
    
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((doc) => mapCategoryDocument(doc))
      .filter(Boolean) as Category[];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const categories = await getCategories();
    console.log('🔍 getCategoryBySlug Debug:');
    console.log('  - Looking for slug:', slug);
    console.log('  - Available categories:', categories.map(c => ({ name: c.name, slug: c.slug, id: c.id })));
    
    const found = categories.find(category => 
      category.slug === slug.toLowerCase()
    ) || null;
    
    console.log('  - Found category:', found ? { name: found.name, id: found.id } : 'null');
    return found;
  } catch (error) {
    console.error('Error fetching category by slug:', error);
    return null;
  }
}

export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    const categories = await getCategories();
    return categories.find(category => category.id === id) || null;
  } catch (error) {
    console.error('Error fetching category by id:', error);
    return null;
  }
}
