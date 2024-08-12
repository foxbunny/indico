// This file is part of Indico.
// Copyright (C) 2002 - 2024 CERN
//
// Indico is free software; you can redistribute it and/or
// modify it under the terms of the MIT License; see the
// LICENSE file for more details.

import PropTypes from 'prop-types';
import React from 'react';

import Dialog from 'indico/react/components/Dialog';
import {Translate, PluralTranslate, Singular, Plural, Param} from 'indico/react/i18n';

import './style.scss';

const debounceTimer = Symbol('debounceTimer');
const debounceTimeout = 500;

function LoadingView({loading, children}) {
  return (
    <div className="category-list-container">
      <p className="categories-loading" aria-live="polite">
        {loading ? <Translate as="span">Please wait.</Translate> : null}
      </p>
      {loading ? null : children}
    </div>
  );
}

LoadingView.propTypes = {
  loading: PropTypes.bool.isRequired,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)])
    .isRequired,
};

function ErrorView({error}) {
  return (
    <p className="category-load-error" role="alert">
      {error ? <Translate>Categories could not be loaded.</Translate> : null}
    </p>
  );
}

ErrorView.propTypes = {
  error: PropTypes.object,
};

ErrorView.defaultProps = {
  error: null,
};

function CategorySearchView({searchFieldRef, onSearch, onCancelSearch, hasSearchKeyword}) {
  // XXX: We're not using a controlled component for the input. Because a lot of the operations surrounding it are async,
  // we don't want to have to deal with races. Instead, we're going to reset the input manually when the time is right.

  function handleSearch(ev) {
    clearTimeout(ev.target[debounceTimer]);
    ev.target[debounceTimer] = setTimeout(() => {
      onSearch(ev.target.value);
    }, debounceTimeout);
  }

  return (
    <>
      <div className="category-search-field" data-has-keyword={hasSearchKeyword}>
        <label>
          <span>
            <Translate>Find a category by keyword:</Translate>
          </span>
          <input
            ref={searchFieldRef}
            type="text"
            placeholder={Translate.string('Search all categories...')}
            aria-describedby="category-search-info"
            onChange={handleSearch}
          />
        </label>
        <button type="button" onClick={onCancelSearch} hidden={!hasSearchKeyword}>
          <Translate as="span">Clear search results</Translate>
        </button>
      </div>
      <p className="category-search-info">
        <Translate>Search results will update as you type.</Translate>
      </p>
    </>
  );
}

CategorySearchView.propTypes = {
  searchFieldRef: PropTypes.object.isRequired,
  onSearch: PropTypes.func.isRequired,
  onCancelSearch: PropTypes.func.isRequired,
  hasSearchKeyword: PropTypes.bool.isRequired,
};

function BreadcrumbView({path, onChangeCategory}) {
  if (!path?.length) {
    return null;
  }

  return (
    <div className="breadcrumbs">
      <Translate as="span">in</Translate>
      {path.map(category => (
        <button
          type="button"
          key={category.id}
          onClick={() => onChangeCategory(category.id)}
          aria-label={Translate.string('View the "{title}" category', {title: category.title})}
        >
          {category.title}
        </button>
      ))}
    </div>
  );
}

BreadcrumbView.propTypes = {
  path: PropTypes.array.isRequired,
  onChangeCategory: PropTypes.func.isRequired,
};

function CategoryItemLabelView({category, onChangeCategory}) {
  if (!category.hasChildren) {
    return <span className="category-nav-list-item-title">{category.title}</span>;
  }

  return (
    <button
      type="button"
      className="category-nav-drilldown"
      onClick={() => onChangeCategory(category.id)}
      disabled={!category.canAccess}
      aria-label={Translate.string('See subcategories under {category}', {
        category: category.title,
      })}
    >
      {category.title}
    </button>
  );
}

CategoryItemLabelView.propTypes = {
  category: PropTypes.object,
  onChangeCategory: PropTypes.func.isRequired,
};

CategoryItemLabelView.defaultProps = {
  category: null,
};

function CategoryStatsView({category}) {
  return (
    <span className="category-nav-stats">
      <span className="category-nav-stats-events" aria-hidden="true">
        <span aria-hidden="true">{category.deepEventCount}</span>
      </span>
      <span className="category-nav-stats-subcategories" aria-hidden="true">
        <span aria-hidden="true">{category.deepCategoryCount}</span>
      </span>
      <ind-with-toggletip key={category.id}>
        <button type="button">
          <span>
            <Translate>Show category stats</Translate>
          </span>
        </button>
        <span data-tip-content aria-live="polite">
          <PluralTranslate count={category.deepEventCount}>
            <Singular>
              There is <Param value={category.deepEventCount} name="count" /> event in{' '}
              <Param value={category.title} name="title" />.
            </Singular>
            <Plural>
              There are <Param value={category.deepEventCount} name="count" /> events in{' '}
              <Param value={category.title} name="title" />.
            </Plural>
          </PluralTranslate>{' '}
          <PluralTranslate count={category.deepCategoryCount}>
            <Singular>
              This category contains <Param value={category.deepCategoryCount} name="count" />{' '}
              subcategory.
            </Singular>
            <Plural>
              This category contains <Param value={category.deepCategoryCount} name="count" />{' '}
              subcategories.
            </Plural>
          </PluralTranslate>
        </span>
      </ind-with-toggletip>
    </span>
  );
}

CategoryStatsView.propTypes = {
  category: PropTypes.object,
};

CategoryStatsView.defaultProps = {
  category: null,
};

function CategoryListView({category, subcategories, onChangeCategory, actionView: ActionView}) {
  if (!category) {
    return null;
  }

  return (
    <article className="category-list-section" aria-labelledby="category-nav-category-list">
      <header>
        <div className="category-nav-actions">
          <div>
            <h3 id="category-nav-category-list" className="category-nav-list-item-title">
              {category.title}
            </h3>
            <BreadcrumbView path={category.path} onChangeCategory={onChangeCategory} />
          </div>
          {ActionView && <ActionView category={category} />}
        </div>
        <CategoryStatsView category={category} />
      </header>
      <ul>
        {subcategories.map(subcategory => (
          <li key={subcategory.id} data-haschildren={subcategory.hasChildren}>
            <div className="category-nav-actions">
              <CategoryItemLabelView onChangeCategory={onChangeCategory} category={subcategory} />
              <div className="category-list-actions">
                {ActionView && <ActionView category={subcategory} />}
              </div>
            </div>
            <CategoryStatsView category={subcategory} />
          </li>
        ))}
      </ul>
    </article>
  );
}

CategoryListView.propTypes = {
  category: PropTypes.object,
  subcategories: PropTypes.array.isRequired,
  onChangeCategory: PropTypes.func.isRequired,
  actionView: PropTypes.elementType,
};

CategoryListView.defaultProps = {
  category: null,
  actionView: undefined,
};

function SearchResultsView({
  searchResults,
  searchKeyword,
  onChangeCategory,
  onCancelSearch,
  actionView: ActionView,
}) {
  return (
    <article className="category-search-results">
      <h3>
        <Translate>Category search results</Translate>
      </h3>
      {searchResults.length ? (
        <ul>
          {searchResults.map(category => (
            <li key={category.id} data-haschildren={category.hasChildren}>
              <div className="category-nav-actions">
                <div>
                  <CategoryItemLabelView category={category} onChangeCategory={onChangeCategory} />
                  <BreadcrumbView path={category.path} onChangeCategory={onChangeCategory} />
                </div>
                {ActionView && <ActionView category={category} />}
              </div>
              <CategoryStatsView category={category} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="category-search-no-results" aria-live="assertive" aria-atomic="true">
          <Translate as="p">
            No categories matched "<Param name="keyword" value={searchKeyword} />
            ".
          </Translate>
          <button type="button" onClick={onCancelSearch}>
            <Translate>Go back to the category list</Translate>
          </button>
        </div>
      )}
    </article>
  );
}

SearchResultsView.propTypes = {
  searchKeyword: PropTypes.string.isRequired,
  searchResults: PropTypes.array,
  onChangeCategory: PropTypes.func.isRequired,
  onCancelSearch: PropTypes.func.isRequired,
  actionView: PropTypes.elementType,
};

SearchResultsView.defaultProps = {
  searchResults: null,
  actionView: undefined,
};

export function DialogView(props) {
  const {
    dialogRef,
    searchFieldRef,
    dialogTitle = 'Navigate to a category',
    loading,
    error,
    onSearch,
    searchKeyword,
    searchResults,
    actionView,
    onChangeCategory,
    onCancelSearch,
    hasSearchKeyword,
    ...categoryListProps
  } = props;

  const commonListProps = {
    actionView,
    onChangeCategory,
  };

  function handleClose(ev) {
    ev.target.closest('dialog').close();
  }

  const closeButton = (
    <button type="button" value="close" onClick={handleClose}>
      <span>
        <Translate>Close</Translate>
      </span>
    </button>
  );

  return (
    <Dialog ref={dialogRef} id="category-nav-dialog" aria-labelledby="category-nav">
      <div className="titlebar">
        <h2 id="category-nav">{dialogTitle}</h2>
        {closeButton}
      </div>
      <div className="content">
        {error ? null : (
          <CategorySearchView
            searchFieldRef={searchFieldRef}
            onSearch={onSearch}
            onCancelSearch={onCancelSearch}
            hasSearchKeyword={hasSearchKeyword}
          />
        )}
        <LoadingView loading={loading}>
          <ErrorView error={error} />
          {searchResults ? (
            <SearchResultsView
              searchResults={searchResults}
              searchKeyword={searchKeyword}
              onCancelSearch={onCancelSearch}
              {...commonListProps}
            />
          ) : (
            <CategoryListView {...categoryListProps} {...commonListProps} />
          )}
        </LoadingView>
      </div>
      <div className="button-bar">{closeButton}</div>
    </Dialog>
  );
}

DialogView.propTypes = {
  dialogRef: PropTypes.object.isRequired,
  searchFieldRef: PropTypes.object.isRequired,
  dialogTitle: PropTypes.string,
  category: PropTypes.object,
  subcategories: PropTypes.array.isRequired,
  searchKeyword: PropTypes.string.isRequired,
  searchResults: PropTypes.array,
  error: PropTypes.object,
  loading: PropTypes.bool.isRequired,
  onChangeCategory: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  onCancelSearch: PropTypes.func.isRequired,
  hasSearchKeyword: PropTypes.bool.isRequired,
  actionView: PropTypes.elementType,
};

DialogView.defaultProps = {
  dialogTitle: undefined,
  category: null,
  searchResults: null,
  error: null,
  actionView: undefined,
};
