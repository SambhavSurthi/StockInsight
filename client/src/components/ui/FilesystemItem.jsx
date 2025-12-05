import { useState } from 'react';
import { ChevronRight, Folder, File } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const FilesystemItem = ({ node, animated = true, onFileClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  const ChevronIcon = () =>
    animated ? (
      <motion.span
        animate={{ rotate: isOpen ? 90 : 0 }}
        transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
        className="flex"
      >
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </motion.span>
    ) : (
      <ChevronRight
        className={`h-4 w-4 text-muted-foreground ${isOpen ? 'rotate-90' : ''}`}
      />
    );

  const ChildrenList = () => {
    const children = node.nodes?.map((childNode) => (
      <FilesystemItem
        node={childNode}
        key={childNode.name}
        animated={animated}
        onFileClick={onFileClick}
      />
    ));

    if (animated) {
      return (
        <AnimatePresence>
          {isOpen && (
            <motion.ul
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="pl-6 overflow-hidden flex flex-col justify-end"
            >
              {children}
            </motion.ul>
          )}
        </AnimatePresence>
      );
    }

    return isOpen && <ul className="pl-6">{children}</ul>;
  };

  const hasChildren = node.nodes && node.nodes.length > 0;
  const isFile = !hasChildren;

  return (
    <li key={node.name}>
      <span className="flex items-center gap-1.5 py-1">
        {hasChildren && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 -m-1 hover:bg-accent rounded transition"
          >
            <ChevronIcon />
          </button>
        )}

        {hasChildren ? (
          <Folder
            className={`h-5 w-5 text-primary fill-primary/20 ${
              node.nodes.length === 0 ? 'ml-[22px]' : ''
            }`}
            style={node.color ? { color: node.color, fill: `${node.color}20` } : {}}
          />
        ) : (
          <File className="ml-[22px] h-5 w-5 text-muted-foreground" />
        )}
        <span
          className={`flex-1 ${isFile && onFileClick ? 'cursor-pointer hover:text-primary' : ''}`}
          onClick={isFile && onFileClick ? () => onFileClick(node) : undefined}
        >
          {node.name}
        </span>
        {node.count !== undefined && (
          <span className="text-xs text-muted-foreground">({node.count})</span>
        )}
      </span>

      <ChildrenList />
    </li>
  );
};

export default FilesystemItem;

