import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storagedProducts = await AsyncStorage.getItem('@GoMarketplace:products');
      
      if(storagedProducts) {
        setProducts([... JSON.parse(storagedProducts)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(async product => {
    const find = products.find(item => item.id == product.id);
    
    if(!!find){
      increment(product.id);
      return;
    } 
    
    product.quantity = 1;
    setProducts([...products, product]);
    
    await AsyncStorage.setItem(
      '@GoMarketplace:products',
      JSON.stringify(products),
    )
  }, [products, setProducts]);

  const increment = useCallback(async id => {
    const newProducts = products.map(product =>
      product.id === id ? {...product, quantity: product.quantity + 1} : product);
    // const productIndex = products.findIndex(product => product.id == id);
    
    // let newProduct = products;
    // newProduct[productIndex].quantity++;    
    
    setProducts(newProducts);

    await AsyncStorage.setItem(
      '@GoMarketplace:products',
      JSON.stringify(newProducts),
    )
  }, [products]);

  const decrement = useCallback(async id => {
    const newProducts = products.map(product =>
      product.id === id ? {...product, quantity: product.quantity - 1} : product);    
    
    setProducts(newProducts);

    await AsyncStorage.setItem(
      '@GoMarketplace:products',
      JSON.stringify(newProducts),
    )
  }, [products]);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
