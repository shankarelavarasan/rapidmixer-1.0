import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';

const SearchBar = ({ searchQuery, onSearchChange, onSearchSubmit }) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef(null);

  const recentSearches = [
    "Invoice processing",
    "Data extraction PDF",
    "Content generation",
    "Excel analysis"
  ];

  const suggestions = [
    { text: "Invoice processing templates", category: "Popular" },
    { text: "PDF data extraction", category: "Popular" },
    { text: "Excel report generation", category: "Recent" },
    { text: "Image text recognition", category: "Trending" },
    { text: "Form processing automation", category: "New" },
    { text: "Document classification", category: "Popular" }
  ];

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    setShowSuggestions(true);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    onSearchChange(value);
    setShowSuggestions(value.length > 0 || isSearchFocused);
  };

  const handleSuggestionClick = (suggestionText) => {
    onSearchChange(suggestionText);
    setShowSuggestions(false);
    setIsSearchFocused(false);
    onSearchSubmit();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearchSubmit();
      setShowSuggestions(false);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setIsSearchFocused(false);
    }
  };

  const clearSearch = () => {
    onSearchChange('');
    searchInputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-2xl" ref={searchInputRef}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
          <Icon name="Search" size={18} className="text-muted-foreground" />
        </div>
        
        <Input
          type="search"
          placeholder="Search templates, categories, or file types..."
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={handleSearchFocus}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10 h-12 text-base"
        />

        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10 p-1 hover:bg-muted rounded-full transition-smooth"
          >
            <Icon name="X" size={16} className="text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-modal z-50 max-h-80 overflow-y-auto">
          {searchQuery.length === 0 && recentSearches.length > 0 && (
            <div className="p-3 border-b border-border">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="Clock" size={14} className="text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Recent Searches
                </span>
              </div>
              <div className="space-y-1">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search)}
                    className="w-full text-left px-2 py-1 text-sm text-foreground hover:bg-muted rounded transition-smooth"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredSuggestions.length > 0 && (
            <div className="p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="Lightbulb" size={14} className="text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Suggestions
                </span>
              </div>
              <div className="space-y-1">
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    className="w-full flex items-center justify-between px-2 py-2 text-sm hover:bg-muted rounded transition-smooth"
                  >
                    <span className="text-foreground">{suggestion.text}</span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {suggestion.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {searchQuery.length > 0 && filteredSuggestions.length === 0 && (
            <div className="p-4 text-center">
              <Icon name="Search" size={24} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No suggestions found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Press Enter to search for "{searchQuery}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;