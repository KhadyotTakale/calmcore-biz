import { useState, useEffect } from "react";
import { Search, Package, Loader2 } from "lucide-react";
import { getItems, Item, searchItems } from "@/services/api";

interface ItemSelectorProps {
  onItemSelect: (item: {
    id: number;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
    imageUrl?: string | null;
  }) => void;
  disabled?: boolean;
}

const ItemSelector = ({
  onItemSelect,
  disabled = false,
}: ItemSelectorProps) => {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Load items on component mount
  useEffect(() => {
    loadItems();
  }, []);

  // Filter items when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredItems(items);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = items.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.tags?.toLowerCase().includes(query) ||
          item.sku?.toLowerCase().includes(query)
      );
      setFilteredItems(filtered);
    }
  }, [searchQuery, items]);

  const loadItems = async (page = 1, append = false) => {
    if (page === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);

    try {
      const response = await getItems(page, 25);

      if (append) {
        setItems((prev) => [...prev, ...response.items]);
        setFilteredItems((prev) => [...prev, ...response.items]);
      } else {
        setItems(response.items);
        setFilteredItems(response.items);
      }

      setHasMorePages(response.nextPage !== null);
      setCurrentPage(page);
    } catch (err) {
      console.error("Failed to load items:", err);
      setError("Failed to load items. Please try again.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMoreItems = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent blur event
    if (hasMorePages && !isLoadingMore) {
      loadItems(currentPage + 1, true);
    }
  };

  const handleItemClick = (item: Item) => {
    // Get first image URL from item
    const imageUrl =
      item._item_images_of_items?.items?.[0]?.display_image || null;

    const selectedItem = {
      id: item.id,
      description: item.title,
      quantity: 1,
      rate: item.price || 0,
      amount: item.price || 0,
      imageUrl: imageUrl,
    };

    onItemSelect(selectedItem);
    setSearchQuery("");
    setIsOpen(false);
  };

  const handleSearchFocus = () => {
    setIsOpen(true);
  };

  const handleSearchBlur = () => {
    // Delay to allow click on item or load more button
    setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          placeholder="Search items by name, SKU, or tags..."
          disabled={disabled || isLoading}
          className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
          <button
            onClick={() => loadItems()}
            className="ml-2 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && !error && (
        <div className="absolute z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
          {(() => {
            // ✅ FILTER OUT DISABLED ITEMS
            const activeItems = filteredItems.filter(
              (item) => !item.Is_disabled
            );

            return activeItems.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading items...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Package className="h-8 w-8 text-muted-foreground/50" />
                    <span>No items found</span>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="divide-y divide-border">
                  {activeItems.map((item) => {
                    const imageUrl =
                      item._item_images_of_items?.items?.[0]?.display_image;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className="w-full p-3 text-left transition-colors hover:bg-muted focus:bg-muted focus:outline-none"
                      >
                        <div className="flex items-start gap-3">
                          {/* Item Image */}
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={item.title}
                              className="w-12 h-12 object-cover rounded border border-border flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                const nextSibling = e.currentTarget
                                  .nextElementSibling as HTMLElement;
                                if (nextSibling) {
                                  nextSibling.style.display = "flex";
                                }
                              }}
                            />
                          ) : null}
                          <div
                            className="w-12 h-12 bg-gray-100 rounded border border-border flex items-center justify-center text-gray-400 text-xs flex-shrink-0"
                            style={{ display: imageUrl ? "none" : "flex" }}
                          >
                            No img
                          </div>

                          {/* Item Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="truncate text-sm font-medium text-foreground">
                                {item.title}
                              </h4>
                              {item.sku && (
                                <span className="flex-shrink-0 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                  {item.sku}
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                {item.description}
                              </p>
                            )}
                            {item.tags && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {item.tags
                                  .split(",")
                                  .slice(0, 3)
                                  .map((tag, idx) => (
                                    <span
                                      key={idx}
                                      className="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary"
                                    >
                                      {tag.trim()}
                                    </span>
                                  ))}
                              </div>
                            )}
                          </div>

                          {/* Price */}
                          <div className="flex-shrink-0 text-right">
                            <div className="text-sm font-semibold text-foreground">
                              ₹{item.price?.toFixed(2) || "0.00"}
                            </div>
                            {item.unit && (
                              <div className="text-xs text-muted-foreground">
                                per {item.unit}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Load More Button */}
                {hasMorePages &&
                  !isLoading &&
                  activeItems.length > 0 &&
                  searchQuery === "" && (
                    <div className="border-t border-border p-3">
                      <button
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent input blur
                          loadMoreItems(e);
                        }}
                        disabled={isLoadingMore}
                        className="w-full rounded-lg border border-primary bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-all hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoadingMore ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading more...
                          </div>
                        ) : (
                          `Load More Items (Page ${currentPage + 1})`
                        )}
                      </button>
                    </div>
                  )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default ItemSelector;
