const fs = require('fs');
const path = require('path');

const fixRestaurantsDetails = () => {
    const file = path.join(__dirname, 'src/pages/RestaurantsDetails.jsx');
    let content = fs.readFileSync(file, 'utf8');

    // 1. Move Modal
    const modalRegex = /\s*\{\/\* Add\/Edit Variant Modal \*\/\}[\s\S]*?<\/Modal>/;
    const match = content.match(modalRegex);
    if (match) {
        const modalStr = match[0];
        content = content.replace(modalStr, '');
        content = content.replace('</div>\n  );\n}', modalStr + '\n    </div>\n  );\n}');
    }

    // 2. Fix image logic
    content = content.replace('setVariantForm({ name: "", price: "", image: null });', 'setVariantForm({ name: "", price: "", image: editingMenuItem?.image || null });');
    content = content.replace('setVariantForm(variant);', 'setVariantForm({ ...variant, image: variant.image !== undefined ? variant.image : (editingMenuItem?.image || null) });');
    content = content.replace('{variant.image ? (', '{(variant.image || editingMenuItem?.image) ? (');
    content = content.replace('<img src={getImageUrl(variant.image)}', '<img src={getImageUrl(variant.image || editingMenuItem?.image)}');
    content = content.replace('{v.image ? (', '{(v.image || viewingMenuItem?.image) ? (');
    content = content.replace('<img src={v.image}', '<img src={getImageUrl(v.image || viewingMenuItem?.image)}');

    // 3. Remove console.error from getProductById catch block
    content = content.replace(/catch\(err\) \{\s*console\.error\(err\);\s*setViewingMenuItem\(item\);\s*\}/g, 'catch(err) {\n                                      setViewingMenuItem(item);\n                                    }');

    // 4. Fix warnings
    content = content.replace(/z-\[100\]/g, 'z-100');
    content = content.replace(/focus:border-primary\/50/g, 'focus:border-primary');
    content = content.replace(/focus:border-primary\/20/g, 'focus:border-primary');

    // 5. Add imports
    content = content.replace('Check, ChevronDown,', 'Check, ChevronDown, X,');
    content = content.replace('import { getChildItemsByParentItem } from "../api/childItemsApi";', 'import { getParentItemsByCategory } from "../api/parentItemsApi";\nimport { getChildItemsByParentItem } from "../api/childItemsApi";\nimport { getProductById } from "../api/productsApi";');

    fs.writeFileSync(file, content);
};

const fixRestaurantsAdd = () => {
    const file = path.join(__dirname, 'src/pages/RestaurantsAdd.jsx');
    let content = fs.readFileSync(file, 'utf8');

    // 1. Fix image logic
    content = content.replace('setVariantForm({ name: "", price: "", image: null });', 'setVariantForm({ name: "", price: "", image: editingMenuItem?.image || null });');
    content = content.replace('setVariantForm(variant);', 'setVariantForm({ ...variant, image: variant.image !== undefined ? variant.image : (editingMenuItem?.image || null) });');
    content = content.replace('{variant.image ? (', '{(variant.image || editingMenuItem?.image) ? (');
    content = content.replace('<img\n                              src={getImageUrl(variant.image)}', '<img\n                              src={getImageUrl(variant.image || editingMenuItem?.image)}');
    content = content.replace('{v.image ? (', '{(v.image || viewingMenuItem?.image) ? (');
    content = content.replace('<img\n                                src={v.image}', '<img\n                                src={getImageUrl(v.image || viewingMenuItem?.image)}');

    // 2. Remove console.error from getProductById catch block
    content = content.replace(/catch\(err\) \{\s*console\.error\(err\);\s*setViewingMenuItem\(item\);\s*\}/g, 'catch(err) {\n                                      setViewingMenuItem(item);\n                                    }');

    // 3. Fix warnings
    content = content.replace(/z-\[100\]/g, 'z-100');
    content = content.replace(/focus:border-primary\/50/g, 'focus:border-primary');

    // 4. Add imports
    content = content.replace('import { getChildItemsByParentItem } from "../api/childItemsApi";', 'import { getChildItemsByParentItem } from "../api/childItemsApi";\nimport { getProductById } from "../api/productsApi";');

    fs.writeFileSync(file, content);
};

fixRestaurantsDetails();
fixRestaurantsAdd();
console.log("Fixed!");
